<script setup lang="ts">
import { usePagination } from '@/shared/composables/usePagination'
import type { SubtaskVM, TaskVM } from '@/shared/services/api/api'
import { displayedAvatars, notifyError, toastSucceed } from '@/shared/utils/common'
import { DateTime } from 'luxon'
import { ConfirmDialog, useConfirm } from 'primevue'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Column from 'primevue/column'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import type { TreeNode } from 'primevue/treenode'
import TreeTable from 'primevue/treetable'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDeleteSubtask } from '../composable/subtask/useDeleteSubtask'
import { useDeleteTask } from '../composable/task/useDeleteTask'
import { useGetListTasks } from '../composable/task/useGetListTask'
import type { TTaskFilter } from '../composable/useTaskCommonFilter'
import { SUBTASK_STATE_CONFIG, type SubtaskStateType } from '../constants/task'
import type { TTaskStatus } from '../models/type'
import { taskPermissionCheck } from '../utils/taskPermissionCheck'

const router = useRouter()
const confirm = useConfirm()

const expandedTaskIds = ref(new Set<string>())

const props = defineProps<{
  activeTab: TTaskStatus
  filterParams: TTaskFilter
}>()

const { isTaskCreator, isTaskLeader } = taskPermissionCheck()

const memoParams = computed(() => ({
  ...props.filterParams,
  tab: props.activeTab
}))

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: 5,
  otherMemoParams: memoParams,
  isMemorizedPage: true
})

const isCompleted = computed(() => props.activeTab === 'COMPLETED')

const { data, isLoading, refetch } = useGetListTasks(() => ({
  filterRequest: {
    name: props.filterParams.search || '',
    staffRole: '',
    accepted: isCompleted.value
  },
  page: tablePagination.value.current,
  size: tablePagination.value.pageSize,
  sort: ['startDate,desc']
}))

const getStaffNames = (staffList: { name: string }[]) => {
  return staffList.map((staff) => staff.name)
}

const getTaskStats = (taskData: TaskVM) => {
  const completedCount = taskData.subtasks.filter(
    (sub: SubtaskVM) => sub.state === 'ACCEPTED'
  ).length
  const overDueCount = taskData.subtasks.filter(
    (sub: SubtaskVM) => sub.state !== 'ACCEPTED' && new Date() > new Date(sub?.deadline)
  ).length
  const totalCount = taskData.subtasks.length

  const latestDeadline = taskData?.subtasks?.reduce((latest: Date, sub: SubtaskVM) => {
    const deadline = new Date(sub.deadline)
    return deadline > latest ? deadline : latest
  }, new Date(taskData?.subtasks?.[0]?.deadline))

  return {
    completedCount,
    totalCount,
    overDueCount,
    progressPercentage: Math.round((completedCount / totalCount) * 100),
    latestDeadline: DateTime.fromJSDate(latestDeadline).toFormat('dd/MM/yyyy')
  }
}

const transformTasksToTreeNodes = (tasks: TaskVM[]): TreeNode[] => {
  const pageOffset =
    (data.value?.pageNumber ?? 0) * (data.value?.pageSize ?? tablePagination.value.pageSize)

  return tasks.map((task, index) => {
    const taskStats = getTaskStats(task)
    const baseData = {
      ...task,
      index: pageOffset + index + 1,
      displayName: task.name,
      completeCount: taskStats.completedCount,
      overDueCount: taskStats.overDueCount,
      totalCount: taskStats.totalCount,
      displayProgressPercentage: isCompleted.value ? 100 : taskStats.progressPercentage,
      displayLeaders: task.leaders ?? [],
      displayCreator: task.creator?.name || '',
      displayDeadline: task.subtasks?.length ? taskStats.latestDeadline : undefined
    }

    const children: TreeNode[] = []

    if (task.subtasks?.length) {
      task.subtasks.forEach((subtask) => {
        const overdueHours = DateTime.fromISO(subtask.deadline).diffNow('hours').hours
        children.push({
          key: subtask.id,
          data: {
            ...subtask,
            displayName: subtask.name,
            displayExecutors: subtask.executors ?? [],
            displayDeadline: DateTime.fromISO(subtask.deadline).toFormat('dd/MM/yyyy'),
            displayStateConfig:
              (subtask.state as SubtaskStateType) !== 'ACCEPTED' && overdueHours < 0
                ? {
                    title: `Quá hạn ${Math.abs(overdueHours) < 24 ? `${Math.abs(overdueHours).toFixed(1)} giờ` : `${Math.abs(Math.floor(overdueHours / 24))} ngày`}`,
                    serverity: 'danger'
                  }
                : SUBTASK_STATE_CONFIG[subtask.state as SubtaskStateType],
            isSubtask: true,
            parent: task
          }
        })
      })
    }

    return {
      key: task.id,
      data: baseData,
      styleClass: 'cursor-pointer',
      children: children.length > 0 ? children : undefined
    }
  })
}

const treeNodes = computed(() => {
  if (!data.value?.items) return []
  return transformTasksToTreeNodes(data.value.items)
})
const selectedKey = ref<Record<string, boolean>>({})

const handleRowClick = (event: TreeNode) => {
  const node = event.node
  const rowData = node?.data || event.data
  const taskId = rowData.id
  if (rowData.isSubtask) {
    selectedKey.value = {}
    return
  }

  if (taskId && !rowData.isSubtask) {
    router.push(`/task/detail/${taskId}`)
  }
}

const { mutate: deleteTask } = useDeleteTask({
  onSuccess: () => {
    refetch?.()
    toastSucceed({ detail: 'Xóa công việc thành công' })
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi xóa công việc')
  }
})

const { mutate: deleteSubtask } = useDeleteSubtask({
  onSuccess: () => {
    refetch?.()
    toastSucceed({ detail: 'Xóa đầu công việc thành công' })
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi xóa đầu công việc')
  }
})

const openDeleteTask = (taskId: string) => {
  confirm.require({
    group: 'confirmProcessTask',
    message: 'Thầy/Cô có chắc chắn muốn xóa công việc này?',
    header: 'Xác nhận xóa công việc',
    rejectProps: {
      label: 'Hủy bỏ',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger'
    },
    accept: () => {
      deleteTask(taskId)
    }
  })
}

const openDeleteSubtask = (subtaskId: string) => {
  confirm.require({
    group: 'confirmProcessTask',
    message: 'Thầy/Cô có chắc chắn muốn xóa đầu công việc này?',
    header: 'Xác nhận xóa đầu công việc',
    rejectProps: {
      label: 'Hủy bỏ',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger'
    },
    accept: () => {
      deleteSubtask(subtaskId)
    }
  })
}

const canDeleteTask = (node: TreeNode) => {
  if (node.data.isSubtask) {
    return isTaskCreator(node.data.parent) || isTaskLeader(node.data.parent)
  } else {
    return isTaskCreator(node.data) || isTaskLeader(node.data)
  }
}

const toggleExpand = (id: string) => {
  if (expandedTaskIds.value.has(id)) {
    expandedTaskIds.value.delete(id)
  } else {
    expandedTaskIds.value.add(id)
  }
}
</script>

<template>
  <div class="card mt-5">
    <TreeTable
      :value="treeNodes"
      :paginator="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      :first="tablePagination.current * tablePagination.pageSize"
      :totalRecords="data?.totalItems"
      :lazy="true"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      @update:rows="updatePageSize"
      tableStyle="min-width: 50rem"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      @node-select="handleRowClick"
      :loading="isLoading"
      :pt="{
        tbody: { class: isLoading ? 'h-[300px]' : '' },
        emptymessage: { class: 'h-[300px]' }
        // row: { class: 'cursor-pointer' }
      }"
    >
      <Column field="displayName" header="Tên công việc" expander style="width: 15rem">
        <template #body="{ node }">
          <div class="flex flex-col p-2">
            <div
              class="line-clamp-3 text-[#2A3547]"
              :style="{
                display: '-webkit-box',
                '-webkit-line-clamp': expandedTaskIds.has(node.data.id) ? 'unset' : 3,
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden',
                'text-overflow': 'ellipsis',
                'max-width': '150px',
                'word-break': 'break-word'
              }"
            >
              {{ node.data.displayName }}
            </div>
            <div
              v-if="node.data.name?.length > 60"
              class="text-primary mt-1 cursor-pointer text-xs hover:underline"
              @click.stop="toggleExpand(node.data.id)"
            >
              {{ expandedTaskIds.has(node.data.id) ? 'Thu gọn' : 'Xem thêm' }}
            </div>
          </div>
        </template>
      </Column>

      <Column field="displayProgress" header="Tiến độ" style="width: 20rem">
        <template #body="{ node }">
          <Tag
            v-if="node.data.isSubtask && node.data.displayStateConfig"
            :value="node.data.displayStateConfig.title"
            :severity="node.data.displayStateConfig.severity"
          />
          <div v-else style="width: 100%">
            <div class="mb-0.5 text-sm text-[#7C8FAC]">
              <span class="text-primary font-semibold">{{ node.data.completeCount }}</span
              >/{{ node.data.totalCount }} hoàn thành<template v-if="node.data.overDueCount"
                >, <span class="font-semibold text-red-500">{{ node.data.overDueCount }}</span> quá
                hạn
              </template>
            </div>
            <div class="block w-full">
              <ProgressBar
                :value="node.data.displayProgressPercentage"
                style="width: 100%; height: 10px"
              />
            </div>
          </div>
        </template>
      </Column>

      <Column field="displayLeaders" header="Người thực hiện" style="width: 20rem">
        <template #body="{ node }">
          <AvatarGroup>
            <template
              v-for="(avatar, idx) in displayedAvatars(
                getStaffNames(node.data.displayExecutors ?? node.data.displayLeaders ?? [])
              )"
              :key="idx"
            >
              <!-- <Tippy
                v-if="!avatar.label.startsWith('+')"
                :inlinePositioning="true"
                :content="(node.data.displayExecutors ?? node.data.displayLeaders ?? [])[idx]?.name"
              > -->
              <Avatar
                :label="avatar.label"
                v-tippy="(node.data.displayExecutors ?? node.data.displayLeaders ?? [])[idx]?.name"
                v-if="!avatar.label.startsWith('+')"
                :style="{ backgroundColor: avatar.color, color: 'white' }"
                shape="circle"
              />
              <!-- </Tippy> -->
              <Avatar
                v-else
                :label="avatar.label"
                :style="{ backgroundColor: avatar.color, color: 'white' }"
                shape="circle"
                class="cursor-pointer"
              />
            </template>
          </AvatarGroup>
        </template>
      </Column>

      <Column field="displayDeadline" header="Thời hạn" style="width: 15rem">
        <template #body="{ node }">
          <span>{{ node.data.displayDeadline }}</span>
        </template>
      </Column>

      <Column field="displayCreator" header="Người tạo" style="width: 15rem">
        <template #body="{ node }">
          {{ node.data.displayCreator }}
        </template>
      </Column>

      <Column header="" style="width: 4rem">
        <template #body="{ node }">
          <i
            v-if="canDeleteTask(node)"
            class="icon-[tabler--trash] text-xl text-red-500 hover:text-red-600"
            @click.stop="
              node.data.isSubtask ? openDeleteSubtask(node.data.id) : openDeleteTask(node.data.id)
            "
            :title="node.data.isSubtask ? 'Xóa đầu công việc' : 'Xóa công việc'"
          />
        </template>
      </Column>

      <template #loadingicon>
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </template>
      <template #empty>
        <div v-show="!isLoading" class="flex flex-col items-center justify-center p-4">
          <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
          <span class="text-2xl font-medium text-gray-400">Không có dữ liệu</span>
        </div>
      </template>
    </TreeTable>
  </div>

  <ConfirmDialog group="confirmProcessTask" />
</template>

<style lang="css" scoped>
::v-deep(.p-progressbar) {
  width: 100% !important;
  border-radius: 10px !important;
  background-color: #e5e7eb !important;
  display: block;
}

::v-deep(.p-progressbar-value) {
  border-radius: 10px !important;
  background-color: #007bff !important;
}

.p-treetable-tbody > tr.p-treetable-row-selected {
  background-color: transparent !important;
  color: inherit !important;
}

::v-deep(.p-treetable-tbody tr td:first-child) {
  padding: 0 !important;
}

::v-deep(.p-treetable-tbody tr td:first-child .p-treetable-node-toggle-button) {
  flex-shrink: 0;
  margin-left: 0 !important;
}

::v-deep(tr.p-treetable-row-selected) {
  background-color: transparent !important;
  color: #334155 !important;
}
</style>
