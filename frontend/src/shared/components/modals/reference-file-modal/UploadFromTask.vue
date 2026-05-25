<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetTaskListForReference } from '@/shared/composables/queries/task/useGetTaskListForReference'
import { usePagination } from '@/shared/composables/usePagination'
import type { TTaskFiles } from '@/shared/models/document'
import { createAvatarData, displayedAvatars } from '@/shared/utils/common'
import { differenceBy, uniqBy } from 'lodash-es'
import type { DataTableSelectAllChangeEvent } from 'primevue'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import ProgressBar from 'primevue/progressbar'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Tippy } from 'vue-tippy'

type TProps = {
  files: TTaskFiles[]
}

type TReferenceTask = {
  id: string
  name: string
  completedCount: number
  overDueCount: number
  totalCount: number
  latestDeadline: Date
  creator: string
  assigneesName: string[]
}

const props = defineProps<TProps>()
const emit = defineEmits<{
  (e: 'update:files', value: TTaskFiles[]): void
}>()

const route = useRoute()
const searchValue = ref<string>((route.query.search as string) || '')
const showAssigneesModal = ref(false)
const currentAssignees = ref<string[]>([])
const expandedTaskIds = ref(new Set<string>())

const columns = [
  {
    header: 'Tên công việc',
    field: 'name',
    customSlot: 'name'
  },
  { header: 'Tiến độ', field: 'progress', customSlot: 'progress' },
  { header: 'Người thực hiện', field: 'assignees', customSlot: 'assignees' },
  { header: 'Thời hạn', field: 'latestDeadline', customSlot: 'latestDeadline' },
  { header: 'Người tạo', field: 'creator' }
]

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: 5,
  otherMemoParams: ref({ search: searchValue.value }),
  isMemorizedPage: true
})

const { data, isLoading } = useGetTaskListForReference(() => ({
  search: searchValue.value,
  page: tablePagination.value.current,
  size: tablePagination.value.pageSize,
  sort: ['startDate,desc']
}))

const formatedData = computed(
  () =>
    (data?.value?.docs ?? [])?.map((task) => {
      const completedCount = task.subtasks.filter((sub) => sub.state === 'ACCEPTED').length
      const overDueCount = task.subtasks.filter(
        (sub) => sub.state !== 'ACCEPTED' && new Date() > new Date(sub?.deadline)
      ).length
      const totalCount = task.subtasks.length
      const latestDeadline = task?.subtasks?.reduce((latest: Date, sub) => {
        const deadline = new Date(sub.deadline)
        return deadline > latest ? deadline : latest
      }, new Date(task?.subtasks?.[0]?.deadline))
      const assigneesName = uniqBy(
        (task?.subtasks ?? [])?.map((subTask) => Array.from(subTask?.executors))?.flat(),
        'staffId'
      )?.map((executor) => executor?.name)
      return {
        id: task?.id,
        name: task?.name,
        completedCount,
        overDueCount,
        totalCount,
        latestDeadline,
        creator: task?.creator?.name,
        assigneesName: assigneesName
      }
    }) as TReferenceTask[]
)

const selectedRows = computed(() => {
  const docs = formatedData.value ?? []
  if (!docs.length) return []
  const selectedSet = new Set(props.files.map((f) => f.id))
  return docs.filter((doc) => selectedSet.has(doc.id))
})

const selectionBinding = computed<TReferenceTask[]>({
  get: () => selectedRows.value,
  set: (val) => onSelectionChange(val)
})

function handleSearch(val?: string) {
  searchValue.value = val || ''
}

function onSelectionChange(newSelection: TReferenceTask[]) {
  const newFromTaskFiles: TTaskFiles[] = newSelection.map((row) => ({
    type: 'fromTask',
    id: row?.id,
    name: row?.name
  }))

  const prevFromTask = props.files
  const visibleIds = new Set((data.value?.docs ?? []).map((d) => d.id))
  const keepOutsidePage = prevFromTask.filter((f) => !visibleIds.has(f.id))
  const merged = [...keepOutsidePage, ...newFromTaskFiles]
  emit('update:files', merged)
}

function handleSelectAllDocumentInPage(e: DataTableSelectAllChangeEvent) {
  const visible = formatedData?.value ?? []
  if (e.checked) {
    selectionBinding.value = uniqBy(
      [...(selectionBinding.value ?? []), ...visible],
      (item) => `${item.id}_task`
    )
  } else {
    selectionBinding.value = differenceBy(selectionBinding.value ?? [], visible, 'id')
  }
}

function getDisplayedAvatars(assignees: string[]) {
  return displayedAvatars(assignees, 3)
}

function openAssigneesModal(assignees: string[]) {
  currentAssignees.value = assignees
  showAssigneesModal.value = true
}

const toggleExpand = (id: string) => {
  if (expandedTaskIds.value.has(id)) {
    expandedTaskIds.value.delete(id)
  } else {
    expandedTaskIds.value.add(id)
  }
}

const modalAvatars = computed(() => {
  return currentAssignees.value.map(createAvatarData)
})
</script>

<template>
  <div class="mt-5 w-full">
    <div class="-col-start-1 mx-5 grid grid-cols-4 gap-4 lg:grid-cols-5">
      <div class="col-span-full flex w-full justify-end">
        <AppFilterBarWithSearch
          class="flex w-full items-end justify-end gap-2"
          placeholder="Tìm kiếm theo tên từ khóa"
          :search-string="searchValue"
          @search="handleSearch"
        >
        </AppFilterBarWithSearch>
      </div>
    </div>

    <div class="mt-5 px-5">
      <AppTable
        class="mt-5"
        :data="formatedData ?? []"
        selection-mode="multiple"
        :columns="columns"
        :loading="isLoading"
        :empty="!isLoading && (data?.docs?.length ?? 0) === 0"
        paginator
        :always-show-paginator="true"
        :totalRecords="data?.docCount"
        :lazy="true"
        :rows="tablePagination.pageSize"
        :rowsPerPageOptions="tablePagination.pageSizeOptions"
        :first="tablePagination.current * tablePagination.pageSize"
        v-model:selection="selectionBinding"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        @update:rows="updatePageSize"
        @update:selection="(val) => onSelectionChange(Array.isArray(val) ? val : [])"
        :select-all="
          !!data?.docs?.length &&
          data?.docs?.every((doc) =>
            (selectionBinding ?? [])?.some((selected) => selected?.id === doc.id)
          )
        "
        @select-all-change="handleSelectAllDocumentInPage"
      >
        <template #name="{ data }">
          <div
            class="line-clamp-3 text-[#2A3547]"
            :title="data.name"
            :style="{
              display: '-webkit-box',
              '-webkit-line-clamp': expandedTaskIds.has(data.id) ? 'unset' : 3,
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              'text-overflow': 'ellipsis',
              'max-width': '150px',
              'word-break': 'break-word'
            }"
          >
            {{ data.name }}
          </div>
          <div
            v-if="data.name?.length > 60"
            class="text-primary mt-1 cursor-pointer text-xs hover:underline"
            @click.stop="toggleExpand(data.id)"
          >
            {{ expandedTaskIds.has(data.id) ? 'Thu gọn' : 'Xem thêm' }}
          </div>
        </template>

        <template #latestDeadline="{ data }">
          <div class="">
            {{ new Date(data.latestDeadline).toLocaleDateString('vi-VN') }}
          </div>
        </template>

        <template #progress="{ data }">
          <div style="width: 100%">
            <div class="mb-0.5 text-sm text-[#7C8FAC]">
              <span class="text-primary font-semibold">{{ data.completedCount }}</span
              >/{{ data.totalCount }} hoàn thành
              <template v-if="data.overDueCount"
                >, <span class="font-semibold text-red-500">{{ data.overDueCount }}</span> quá hạn
              </template>
            </div>
            <div class="block w-full">
              <ProgressBar
                :value="Math.round((data?.completedCount / data?.totalCount) * 100)"
                style="width: 100%; height: 10px"
              />
            </div>
          </div>
        </template>
        <template #assignees="{ data }">
          <AvatarGroup>
            <template
              v-for="(avatar, idx) in getDisplayedAvatars(data.assigneesName ?? [])"
              :key="idx"
            >
              <Avatar
                :label="avatar.label"
                v-tippy="data.assigneesName[idx]"
                v-if="!avatar.label.startsWith('+')"
                :style="{ backgroundColor: avatar.color, color: 'white' }"
                shape="circle"
              />
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
      </AppTable>
    </div>

    <AppModal
      v-model:visible="showAssigneesModal"
      title="Danh sách người thực hiện"
      class-content="p-4"
    >
      <div class="flex flex-wrap gap-3">
        <Tippy v-for="(avatar, idx) in modalAvatars" :key="idx" :content="currentAssignees[idx]">
          <Avatar
            :label="avatar.label"
            :style="{ backgroundColor: avatar.color, color: 'white' }"
            shape="circle"
            size="normal"
          />
        </Tippy>
      </div>
    </AppModal>
  </div>
</template>
