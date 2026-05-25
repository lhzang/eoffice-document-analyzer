<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import type { StaffDTO, SubtaskVM, TaskVM } from '@/shared/services/api'
import { notifyError, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { ConfirmDialog, useConfirm, useToast } from 'primevue'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useAcceptSubtask } from '../composable/subtask/useAcceptSubtask'
import { useCompleteSubtask } from '../composable/subtask/useCompleteSubtask'
import { useRejectSubtask } from '../composable/subtask/useRejectSubtask'
import { useUpdateSubtask } from '../composable/subtask/useUpdateSubtask'
import { SUBTASK_ROLE, SUBTASK_STATE } from '../constants/task'
import { taskPermissionCheck } from '../utils/taskPermissionCheck'
import Report from './Report.vue'
import SubTaskAvatarGroup from './SubTaskAvatarGroup.vue'

interface Props {
  subtask: SubtaskVM
  task?: TaskVM
}

const props = defineProps<Props>()

const modalRef = useTemplateRef<InstanceType<typeof AppModal> | null>('modalRef')

const queryClient = useQueryClient()

const { isTaskCreator, isTaskLeader, isSubtaskExecutor } = taskPermissionCheck()

const approvalPopoverRef = useTemplateRef<InstanceType<typeof Popover> | null>('approvalPopoverRef')

const toast = useToast()

const isRejectOnlyMode = ref(false)

type RejectModalType = InstanceType<typeof AppModalWithMessage>
const rejectModalRef = ref<RejectModalType | null>(null)

const confirm = useConfirm()

const { mutate: updateSubtask } = useUpdateSubtask()

const invalidateTaskQueries = () => {
  if (props.task?.id) {
    queryClient.invalidateQueries({ queryKey: ['getTaskById', props.task.id] })
  }
  queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
}

const { mutate: acceptSubtask } = useAcceptSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Xác nhận công việc thành công!' })
    approvalPopoverRef.value?.hide()
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi xác nhận công việc')
  }
})

const { mutate: completeSubtask } = useCompleteSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Hoàn thành công việc thành công!' })
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi hoàn thành công việc')
  }
})

const { mutate: rejectSubtask } = useRejectSubtask({
  onSuccess: () => {
    toastSucceed({ summary: 'Từ chối công việc thành công!' })
    rejectModalRef.value?.closeModal()
    invalidateTaskQueries()
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi từ chối công việc')
  }
})

const isExecutor = computed(() => isSubtaskExecutor(props.subtask))
const isLeader = computed(() => isTaskLeader(props.task))

const showCompleteButton = computed(() => {
  return props.subtask?.state === SUBTASK_STATE.executing && isExecutor.value && !isLeader.value
})

const showApprovalButton = computed(() => {
  return (
    (props.subtask?.state === SUBTASK_STATE.evaluationPending ||
      props.subtask?.state === SUBTASK_STATE.executing) &&
    isLeader.value
  )
})

const showCompletedButton = computed(() => {
  return props.subtask?.state === SUBTASK_STATE.accepted && isLeader.value
})

const showPendingStatusButton = computed(() => {
  return (
    props.subtask?.state === SUBTASK_STATE.evaluationPending && isExecutor.value && !isLeader.value
  )
})

const showAcceptedStatusButton = computed(() => {
  return props.subtask?.state === SUBTASK_STATE.accepted && isExecutor.value && !isLeader.value
})

const canEditSubtask = computed(() => {
  return isTaskCreator(props.task) || isTaskLeader(props.task)
})

const editingSubtaskName = ref(false)
const localSubtaskName = ref<string>('')
const subtaskNameInputRef = ref<HTMLInputElement | null>(null)

const editingSubtaskContent = ref(false)
const localSubtaskContent = ref<string>('')
const subtaskContentInputRef = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.subtask?.name,
  (newName) => {
    if (!editingSubtaskName.value && newName && localSubtaskName.value !== newName) {
      localSubtaskName.value = newName
    }
  },
  { immediate: true }
)

watch(
  () => props.subtask?.content,
  (newContent) => {
    if (!editingSubtaskContent.value) {
      localSubtaskContent.value = newContent || ''
    }
  },
  { immediate: true }
)

watch(editingSubtaskName, (isEditing) => {
  if (isEditing) {
    nextTick(() => {
      subtaskNameInputRef.value?.focus()
      subtaskNameInputRef.value?.select()
    })
  }
})

watch(editingSubtaskContent, (isEditing) => {
  if (isEditing) {
    nextTick(() => {
      subtaskContentInputRef.value?.focus()
    })
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

const handleWaitApproval = (event: Event) => {
  isRejectOnlyMode.value = false
  approvalPopoverRef.value?.toggle(event, event.currentTarget as HTMLElement)
}

const handleCompletedApproval = (event: Event) => {
  isRejectOnlyMode.value = true
  approvalPopoverRef.value?.toggle(event, event.currentTarget as HTMLElement)
}

const handleApprove = () => {
  confirm.require({
    group: 'confirmProcessSubTask',
    message: 'Thầy/Cô có chắc chắn muốn xác nhận đầu công việc này?',
    header: 'Xác nhận đầu công việc',
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
  approvalPopoverRef.value?.hide()
  rejectModalRef.value?.openModal()
}

const handleConfirmReject = (reason?: string) => {
  confirm.require({
    group: 'confirmProcessSubTask',
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
      rejectSubtask({ subtaskId: props.subtask.id, reason })
    }
  })
}

const handleComplete = () => {
  confirm.require({
    group: 'confirmProcessSubTask',
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

const handleUpdateSubtaskName = (payload: FocusEvent) => {
  const name = payload.target as HTMLInputElement
  const newName = name.value
  const trimmedName = newName.trim()

  editingSubtaskName.value = false

  if (!props.subtask?.id) return

  if (!trimmedName) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Tên đầu công việc không được để trống',
      life: 3000
    })
    localSubtaskName.value = props.subtask.name || ''
    return
  }

  const previousName = localSubtaskName.value
  localSubtaskName.value = trimmedName

  const staff: StaffDTO[] = []

  if (props.subtask.executors) {
    Array.from(props.subtask.executors).forEach((executor) => {
      staff.push({
        id: executor.staffId,
        role: SUBTASK_ROLE.executor
      })
    })
  }

  if (props.subtask.collaborators) {
    Array.from(props.subtask.collaborators).forEach((collaborator) => {
      staff.push({
        id: collaborator.staffId,
        role: SUBTASK_ROLE.collaborator
      })
    })
  }

  updateSubtask(
    {
      subtaskId: props.subtask.id,
      request: {
        name: trimmedName,
        content: localSubtaskContent.value || '',
        staff: staff
      }
    },
    {
      onSuccess: () => {
        toastSucceed({ summary: 'Cập nhật tên đầu công việc thành công!' })
        if (props.task?.id) {
          queryClient.invalidateQueries({ queryKey: ['getTaskById', props.task.id] })
        }
        queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
      },
      onError: (error) => {
        localSubtaskName.value = previousName
        notifyError(error as TServerError, 'Lỗi khi cập nhật tên đầu công việc')
      }
    }
  )
}

const handleUpdateSubtaskContent = (event: FocusEvent) => {
  const content = (event.target as HTMLTextAreaElement).value
  const trimmedContent = content.trim()

  editingSubtaskContent.value = false

  if (!props.subtask?.id) return

  if (trimmedContent === (props.subtask.content || '').trim()) {
    return
  }

  const previousContent = localSubtaskContent.value
  localSubtaskContent.value = trimmedContent

  const staff: StaffDTO[] = []

  if (props.subtask.executors) {
    Array.from(props.subtask.executors).forEach((executor) => {
      staff.push({
        id: executor.staffId,
        role: SUBTASK_ROLE.executor
      })
    })
  }

  if (props.subtask.collaborators) {
    Array.from(props.subtask.collaborators).forEach((collaborator) => {
      staff.push({
        id: collaborator.staffId,
        role: SUBTASK_ROLE.collaborator
      })
    })
  }

  updateSubtask(
    {
      subtaskId: props.subtask.id,
      request: {
        name: localSubtaskName.value,
        content: trimmedContent,
        staff: staff
      }
    },
    {
      onSuccess: () => {
        toastSucceed({ summary: 'Cập nhật mô tả đầu công việc thành công!' })
        if (props.task?.id) {
          queryClient.invalidateQueries({ queryKey: ['getTaskById', props.task.id] })
        }
        queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
      },
      onError: (error) => {
        localSubtaskContent.value = previousContent
        notifyError(error as TServerError, 'Lỗi khi cập nhật mô tả đầu công việc')
      }
    }
  )
}

const handleSubtaskNameEnterKey = (event: KeyboardEvent) => {
  event.preventDefault()
  const target = event.target as HTMLInputElement
  target.blur()
}

const handleDescriptionEnterKey = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    event.preventDefault()
    const target = event.target as HTMLTextAreaElement
    target.blur()
  }
}

defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>

<template>
  <AppModal ref="modalRef" title="Chi tiết đầu công việc" :wrapper-style="{ width: '80%' }">
    <div class="">
      <div class="border-b border-dashed border-blue-300 pb-4">
        <div class="flex items-end justify-between">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <input
              ref="subtaskNameInputRef"
              :value="localSubtaskName"
              @blur="handleUpdateSubtaskName"
              @keydown.enter="handleSubtaskNameEnterKey"
              :title="localSubtaskName"
              :class="[
                '[field-sizing:content] min-w-0 rounded px-2 py-1 text-lg font-semibold',
                editingSubtaskName
                  ? 'border-primary focus:border-primary cursor-text border focus:outline-none'
                  : 'cursor-default border-none bg-transparent focus:outline-none'
              ]"
              :style="
                editingSubtaskName
                  ? undefined
                  : {
                      maxWidth: '500px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }
              "
              :readonly="!editingSubtaskName"
              type="text"
              :placeholder="localSubtaskName || 'Chi tiết đầu công việc'"
            />
            <i
              v-if="canEditSubtask && !editingSubtaskName"
              class="icon-[mynaui--edit] flex-shrink-0 cursor-pointer text-lg"
              @click.stop="editingSubtaskName = true"
            />
          </div>
          <div class="relative">
            <div class="flex w-full justify-end gap-2">
              <Button v-if="showCompleteButton" label="Hoàn thành" @click="handleComplete" />
              <Button
                v-if="showApprovalButton"
                ref="approvalButtonRef"
                label="Phê duyệt"
                @click="handleWaitApproval"
              />
              <Button
                v-if="showCompletedButton"
                ref="approvalButtonRef"
                label="Đã hoàn thành"
                @click="handleCompletedApproval"
              />
              <Button v-if="showPendingStatusButton" label="Đang chờ duyệt" disabled />
              <Button v-if="showAcceptedStatusButton" label="Đã hoàn thành" disabled />
            </div>

            <Popover ref="approvalPopoverRef">
              <div class="">
                <div
                  v-if="!isRejectOnlyMode"
                  class="flex cursor-pointer items-center gap-2 px-1 py-1 transition-colors hover:bg-gray-100"
                  @click="handleApprove"
                >
                  <span class="text-base">Xác nhận</span>
                </div>
                <div
                  v-if="isRejectOnlyMode"
                  class="flex cursor-pointer items-center gap-2 px-1 py-1 transition-colors hover:bg-gray-100"
                  @click="handleReject"
                >
                  <span class="text-base">Từ chối</span>
                </div>
              </div>
            </Popover>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="w-[50%] border-r border-gray-200 p-6">
          <SubTaskAvatarGroup :subtask="subtask" :readonly="!canEditSubtask" />

          <div class="mb-6">
            <label class="mb-2 flex items-center gap-2 text-base font-medium">
              <i class="pi pi-calendar"></i>
              Thời hạn:
            </label>
            <div class="">{{ formatDeadline(subtask.deadline) }}</div>
          </div>

          <div class="mb-6">
            <div class="mb-2 flex items-center gap-2">
              <span class="icon-[pepicons-pencil--menu] text-xl"></span>
              <div class="text-base font-medium">Mô tả đầu công việc</div>
              <i
                v-if="canEditSubtask && !editingSubtaskContent"
                class="icon-[mynaui--edit] cursor-pointer text-lg"
                @click.stop="editingSubtaskContent = true"
              />
            </div>
            <textarea
              maxlength="150"
              v-if="editingSubtaskContent"
              ref="subtaskContentInputRef"
              :value="localSubtaskContent"
              @blur="handleUpdateSubtaskContent"
              @keydown.enter="handleDescriptionEnterKey"
              class="border-primary focus:border-primary w-full rounded-lg border p-2 focus:outline-none"
              rows="4"
            ></textarea>
            <div v-else class="break-words whitespace-pre-wrap">
              {{ subtask.content || 'Chưa có mô tả' }}
            </div>
          </div>
        </div>
        <Report :subtask="subtask" :task="task" />
      </div>
    </div>
    <ConfirmDialog group="confirmProcessSubTask" />
  </AppModal>

  <AppModalWithMessage
    ref="rejectModalRef"
    title="Từ chối đầu công việc"
    :isMessageRequired="false"
    @submit="({ message }) => handleConfirmReject(message)"
    labelMessageInput="Lý do từ chối"
  />
</template>
