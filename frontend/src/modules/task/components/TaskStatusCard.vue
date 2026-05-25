<script setup lang="ts">
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import type { SubtaskReportVM, SubtaskVM, TaskVM } from '@/shared/services/api'
import { displayedAvatars, notifyError, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { ConfirmDialog, useConfirm } from 'primevue'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Popover from 'primevue/popover'
import Tag from 'primevue/tag'
import { computed, ref, useTemplateRef } from 'vue'
import { useAcceptSubtask } from '../composable/subtask/useAcceptSubtask'
import { useCompleteSubtask } from '../composable/subtask/useCompleteSubtask'
import { useDeleteSubtask } from '../composable/subtask/useDeleteSubtask'
import { useRejectSubtask } from '../composable/subtask/useRejectSubtask'
import { SUBTASK_STATE } from '../constants/task'
import { taskPermissionCheck } from '../utils/taskPermissionCheck'
import DetailSubTask from './DetailSubTask.vue'

interface Props {
  subtask: SubtaskVM
  task?: TaskVM
  totalSubtasksCount?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'lastSubtaskDeleted'): void
}>()

const { isTaskCreator, isTaskLeader, isSubtaskExecutor } = taskPermissionCheck()
const queryClient = useQueryClient()
const invalidateTaskQueries = () => {
  if (props.task?.id) {
    queryClient.invalidateQueries({ queryKey: ['getTaskById', props.task.id] })
  }
  queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
}

const detailSubtaskRef = ref<InstanceType<typeof DetailSubTask> | null>(null)

const actionPopoverRef = useTemplateRef<InstanceType<typeof Popover> | null>('actionPopoverRef')
type ModalType = InstanceType<typeof AppModalWithMessage>
const rejectModalRef = ref<ModalType | null>(null)

const confirm = useConfirm()

const { mutate: deleteSubtask } = useDeleteSubtask({
  onSuccess: () => {
    const isLastSubtask = props.totalSubtasksCount === 1
    toastSucceed({ summary: 'Xóa đầu công việc thành công!' })
    invalidateTaskQueries()
    if (isLastSubtask) {
      emit('lastSubtaskDeleted')
    }
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi xóa đầu công việc')
  }
})

const { mutate: acceptSubtask } = useAcceptSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Duyệt đầu công việc thành công!' })
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi duyệt đầu công việc')
  }
})

const { mutate: completeSubtask } = useCompleteSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Hoàn thành đầu công việc thành công!' })
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi hoàn thành đầu công việc')
  }
})

const { mutate: rejectSubtask } = useRejectSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Từ chối đầu công việc thành công!' })
    rejectModalRef.value?.closeModal()
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi từ chối đầu công việc')
  }
})

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getExecutorNames = (executors: Set<{ name: string }>) => {
  return Array.from(executors).map((executor) => executor.name)
}

const executorNames = computed(() => getExecutorNames(props.subtask.executors))

const isExecutor = computed(() => isSubtaskExecutor(props.subtask))
const isLeader = computed(() => isTaskLeader(props.task))
const isCreator = computed(() => isTaskCreator(props.task))

const canDelete = computed(() => isLeader.value || isCreator.value)
const canComplete = computed(
  () => props.subtask.state === SUBTASK_STATE.executing && isExecutor.value && !isLeader.value
)

const isExpired = computed(() => {
  if (props.subtask.state !== SUBTASK_STATE.executing) return false
  const deadline = new Date(props.subtask.deadline)
  const now = new Date()
  return deadline < now
})
const canApprove = computed(
  () =>
    (props.subtask.state === SUBTASK_STATE.evaluationPending ||
      props.subtask.state === SUBTASK_STATE.executing) &&
    isLeader.value
)
const canReject = computed(() => {
  return (
    (props.subtask.state === SUBTASK_STATE.evaluationPending ||
      props.subtask.state === 'ACCEPTED') &&
    isLeader.value
  )
})

const showActionMenu = computed(() => {
  return canDelete.value || canComplete.value || canApprove.value || canReject.value
})

const getReportCount = (reports?: Array<SubtaskReportVM>) => {
  return reports?.length || 0
}

const getFileCount = (reports?: Array<SubtaskReportVM>) => {
  if (!reports || reports.length === 0) return 0
  return reports.reduce((total, report) => {
    if (report.files) {
      const fileCount = Array.from(report.files).length
      return total + fileCount
    }
    return total
  }, 0)
}

const openSubtaskModal = () => {
  detailSubtaskRef.value?.openModal()
}

const handleActionMenu = (event: Event) => {
  event.stopPropagation()
  actionPopoverRef.value?.toggle(event, event.currentTarget)
}

const handleDelete = () => {
  confirm.require({
    group: `delete-${props.subtask.id}`,
    message: 'Thầy/Cô có chắc chắn muốn xóa đầu công việc này?',
    header: 'Xác nhận xóa đầu công việc',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger'
    },
    accept: () => {
      if (!props.subtask.id) return
      deleteSubtask(props.subtask.id)
    }
  })
}

const handleComplete = () => {
  confirm.require({
    group: `complete-${props.subtask.id}`,
    message: 'Thầy/Cô có chắc chắn muốn hoàn thành đầu công việc này?',
    header: 'Hoàn thành đầu công việc',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!props.subtask.id) return
      completeSubtask(props.subtask.id)
    }
  })
}

const handleApprove = () => {
  confirm.require({
    group: `approve-${props.subtask.id}`,
    message: 'Thầy/Cô có chắc chắn muốn duyệt đầu công việc này?',
    header: 'Xác nhận duyệt đầu công việc',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!props.subtask.id) return
      acceptSubtask(props.subtask.id)
    }
  })
}

const handleReject = () => {
  actionPopoverRef.value?.hide()
  rejectModalRef.value?.openModal()
}

const confirmRejectSubtask = (reason?: string) => {
  confirm.require({
    group: `reject-${props.subtask.id}`,
    message: 'Thầy/Cô có chắc chắn muốn từ chối đầu công việc này?',
    header: 'Từ chối đầu công việc',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      if (!props.subtask.id) return
      rejectSubtask({ subtaskId: props?.subtask?.id, reason })
    }
  })
}
</script>

<template>
  <div class="card cursor-pointer" @click="openSubtaskModal">
    <div class="mb-2 flex items-start justify-between gap-2 text-base font-semibold text-[#2A3547]">
      <span
        class="line-clamp-2 overflow-y-hidden wrap-break-word whitespace-pre-wrap"
        :title="subtask.name"
        >{{ subtask.name }}</span
      >
      <Tag v-if="isExpired" value="Quá hạn" severity="danger" class="shrink-0" />
    </div>
    <div class="mb-2 border-t border-dashed border-[#00000040] pt-2">
      <span class="font-semibold text-[#7C8FAC]">Thời hạn:</span>
      <span class="ml-1 text-[#2A3547]">{{ formatDeadline(subtask.deadline) }}</span>
    </div>
    <div class="mb-3 flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-[#7C8FAC]">Mô tả:</span>
      </div>
      <div
        class="line-clamp-2 overflow-hidden break-words whitespace-pre-wrap text-[#2A3547]"
        :title="subtask.content"
      >
        {{ subtask.content || 'Chưa có nội dung' }}
      </div>
    </div>
    <div class="flex items-center justify-between border-t border-[#00000040] pt-2">
      <div class="flex items-center gap-3">
        <AvatarGroup>
          <template v-for="(avatar, index) in displayedAvatars(executorNames, 2)" :key="index">
            <Avatar
              v-if="!avatar.label.startsWith('+')"
              :label="avatar.label"
              :style="{ backgroundColor: avatar.color, color: 'white' }"
              v-tippy="executorNames[index]"
              shape="circle"
              size="small"
            />
            <Avatar
              v-else
              :label="avatar.label"
              :style="{ backgroundColor: avatar.color, color: 'white' }"
              shape="circle"
              size="small"
              class="cursor-pointer"
            />
          </template>
        </AvatarGroup>
        <span class="flex items-center gap-1 text-xs text-gray-600">
          <i class="icon-[mdi-light--comment] text-xl"></i>
          {{ getReportCount(subtask.reports) }}
        </span>
        <span class="flex items-center gap-1 text-xs text-gray-600">
          <i class="pi pi-paperclip"></i>
          {{ getFileCount(subtask.reports) }}
        </span>
      </div>

      <div v-if="showActionMenu" class="relative">
        <i
          class="icon-[qlementine-icons--menu-dots-16] cursor-pointer text-gray-500 transition-colors hover:text-gray-700"
          @click="handleActionMenu"
        />
        <Popover ref="actionPopoverRef" class="p-0">
          <div class="">
            <button
              v-if="canComplete"
              class="w-full px-4 py-2 text-left text-base text-gray-700 transition-colors hover:bg-gray-100"
              @click="handleComplete"
            >
              Hoàn thành đầu công việc
            </button>
            <button
              v-if="canApprove"
              class="w-full px-4 py-2 text-left text-base text-gray-700 transition-colors hover:bg-gray-100"
              @click="handleApprove"
            >
              Duyệt đầu công việc
            </button>
            <button
              v-if="canReject"
              class="w-full px-4 py-2 text-left text-base text-gray-700 transition-colors hover:bg-gray-100"
              @click="handleReject"
            >
              Từ chối đầu công việc
            </button>
            <div
              v-if="canDelete && (canComplete || canApprove || canReject)"
              class="my-1 border-t border-gray-200"
            ></div>
            <button
              v-if="canDelete"
              class="w-full px-4 py-2 text-left text-base text-red-600 transition-colors hover:bg-red-50"
              @click="handleDelete"
            >
              Xóa đầu công việc
            </button>
          </div>
        </Popover>
      </div>
    </div>
  </div>

  <DetailSubTask ref="detailSubtaskRef" :subtask="subtask" :task="task" />

  <AppModalWithMessage
    ref="rejectModalRef"
    title="Từ chối đầu công việc"
    :isMessageRequired="false"
    @submit="({ message }) => confirmRejectSubtask(message)"
    labelMessageInput="Lý do từ chối"
  />

  <ConfirmDialog :group="`delete-${props.subtask.id}`" />
  <ConfirmDialog :group="`complete-${props.subtask.id}`" />
  <ConfirmDialog :group="`completeAndApprove-${props.subtask.id}`" />
  <ConfirmDialog :group="`approve-${props.subtask.id}`" />
  <ConfirmDialog :group="`reject-${props.subtask.id}`" />
</template>
