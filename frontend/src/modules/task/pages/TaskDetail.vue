<script setup lang="ts">
import PdfViewer from '@/shared/components/PdfViewer.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import type { FilesBySource } from '@/shared/models/document'
import type { StaffDTO } from '@/shared/services/api'
import { isDoc, isPdf } from '@/shared/utils/check'
import {
  createFileFromUrl,
  downLoadDocumentFileViaUrl,
  getFileName,
  getFullFileUrl,
  notifyError,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import { mappingRelatedFromDocType } from '@/shared/utils/document'
import { useQueryClient } from '@tanstack/vue-query'
import { useToast } from 'primevue'
import Button from 'primevue/button'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateSubtask from '../components/CreateSubtask.vue'
import ListSubtask from '../components/ListSubtask.vue'
import TaskAvatarGroup from '../components/TaskAvatarGroup.vue'
import { useGetTaskById } from '../composable/task/useGetDetailTask'
import { useUpdateTaskFiles } from '../composable/task/useUpdateTaskFiles'
import { useUpdateTaskInfo } from '../composable/task/useUpdateTaskInfo'
import { TASK_ROLE } from '../constants/task'
import { taskPermissionCheck } from '../utils/taskPermissionCheck'

const queryClient = useQueryClient()

const route = useRoute()
const router = useRouter()
const taskId = computed(() => route.params.id as string)
const { data: taskData } = useGetTaskById(taskId)
const { isTaskCreator, isTaskLeader } = taskPermissionCheck()

const { mutate: updateTaskFiles, isPending: updatingTaskFiles } = useUpdateTaskFiles({
  onSuccess: () => {
    toastSucceed({ summary: 'Cập nhật file căn cứ thành công!' })
    currentSelectedFiles.value = {
      fromDoc: [],
      fromTask: [],
      upload: []
    }
    if (taskData.value?.id) {
      queryClient.invalidateQueries({ queryKey: ['getTaskById', taskData.value.id] })
    }
    queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
  },
  onError: (error) => {
    notifyError(error as TServerError, 'Lỗi khi cập nhật file căn cứ')
  }
})
const { mutate: updateTaskInfo } = useUpdateTaskInfo({
  onSuccess: () => {
    toastSucceed({ summary: 'Cập nhật thông tin công việc thành công!' })
    if (taskData.value?.id) {
      queryClient.invalidateQueries({ queryKey: ['getTaskById', taskData.value.id] })
    }
    queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
  },
  onError: (error) => {
    localTaskName.value = taskData.value?.name || ''
    notifyError(error as TServerError, 'Lỗi khi cập nhật thông tin công việc')
  }
})

const { mutateAsync: convertFile } = useConvertDocxIntoPdf()

const addSubTaskModalRef = useTemplateRef<InstanceType<typeof CreateSubtask> | null>(
  'addSubTaskModalRef'
)

const toast = useToast()

const selectedFileForPreview = ref(false)
const filetoPreview = ref<string | null>(null)

const taskNameInputRef = ref<HTMLInputElement | null>(null)

const editingTaskName = ref(false)
const localTaskName = ref<string>('')
const originalTaskName = ref<string>('')

const editingTaskContent = ref(false)
const localTaskContent = ref<string>('')
const originalTaskContent = ref<string>('')
const taskContentInputRef = ref<HTMLTextAreaElement | null>(null)

const abortController = ref<AbortController | null>(null)
const isProcessFetchAndConverExternalFile = ref(false)

const currentSelectedFiles = ref<FilesBySource>({
  fromDoc: [],
  fromTask: [],
  upload: []
})

const taskFiles = computed(() => {
  if (!taskData.value?.files) return []
  return Array.from(taskData.value.files)
})

const subtasks = computed(() => {
  if (!taskData.value?.subtasks) return []
  return taskData.value.subtasks
})

const canEditTask = computed(() => isTaskCreator(taskData.value) || isTaskLeader(taskData.value))

const expanded = ref(false)

const visibleFiles = computed(() => {
  if (expanded.value) return taskFiles.value
  return taskFiles.value.slice(0, 5)
})

watch(
  () => taskData.value?.name,
  (newName) => {
    if (!editingTaskName.value && newName && localTaskName.value !== newName) {
      localTaskName.value = newName
      originalTaskName.value = newName
    }
  },
  { immediate: true }
)

watch(
  () => taskData.value?.content,
  (newContent) => {
    if (!editingTaskContent.value) {
      localTaskContent.value = newContent || ''
      originalTaskContent.value = newContent || ''
    }
  },
  { immediate: true }
)

watch(editingTaskName, (isEditing) => {
  if (isEditing) {
    nextTick(() => {
      taskNameInputRef.value?.focus()
    })
  }
})

watch(editingTaskContent, (isEditing) => {
  if (isEditing) {
    nextTick(() => {
      taskContentInputRef.value?.focus()
    })
  }
})

const goBackToList = () => {
  router.push('/task/list')
}

const handleUpdateTaskName = (payload: FocusEvent) => {
  const name = payload.target as HTMLInputElement
  const newName = name.value
  const trimmedName = newName.trim()

  editingTaskName.value = false

  if (!taskId.value || !taskData.value) return

  if (!trimmedName) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Tên công việc không được để trống',
      life: 3000
    })
    localTaskName.value = taskData.value.name || ''
    return
  }

  localTaskName.value = trimmedName

  const staff: StaffDTO[] = []

  if (taskData.value.leaders) {
    Array.from(taskData.value.leaders).forEach((leader) => {
      staff.push({
        id: leader.staffId,
        role: TASK_ROLE.leader
      })
    })
  }

  if (taskData.value.viewers) {
    Array.from(taskData.value.viewers).forEach((viewer) => {
      staff.push({
        id: viewer.staffId,
        role: TASK_ROLE.viewer
      })
    })
  }

  updateTaskInfo({
    taskId: taskId.value,
    request: {
      name: trimmedName,
      content: localTaskContent.value || '',
      staff: staff
    }
  })
}

const handleUpdateTaskContent = (event: FocusEvent) => {
  const content = (event.target as HTMLTextAreaElement).value
  const trimmedContent = content.trim()

  editingTaskContent.value = false

  if (!taskId.value || !taskData.value) return

  if (trimmedContent === (originalTaskContent.value || '').trim()) {
    return
  }

  localTaskContent.value = trimmedContent

  const staff: StaffDTO[] = []

  if (taskData.value.leaders) {
    Array.from(taskData.value.leaders).forEach((leader) => {
      staff.push({
        id: leader.staffId,
        role: TASK_ROLE.leader
      })
    })
  }

  if (taskData.value.viewers) {
    Array.from(taskData.value.viewers).forEach((viewer) => {
      staff.push({
        id: viewer.staffId,
        role: TASK_ROLE.viewer
      })
    })
  }

  updateTaskInfo({
    taskId: taskId.value,
    request: {
      name: localTaskName.value,
      content: trimmedContent,
      staff: staff
    }
  })
}

const handleEnterKey = (event: KeyboardEvent) => {
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

const handleUpdateTaskFiles = (filesBySource: FilesBySource) => {
  const uploadFilesList = (filesBySource?.upload ?? [])?.map((file) => file?.file)

  const existingFiles = (filesBySource?.fromDoc ?? [])?.map((relatedDoc) => ({
    relatedId: relatedDoc?.id,
    type: mappingRelatedFromDocType(relatedDoc?.docType)
  }))

  updateTaskFiles({
    taskId: taskId.value,
    request: { existingFiles },
    files: uploadFilesList
  })
}

const handleChangeMainFile = async (filePath: string) => {
  abortController.value?.abort()
  if (isDoc(filePath)) {
    try {
      isProcessFetchAndConverExternalFile.value = true
      abortController.value = new AbortController()
      const fetchedFile = await createFileFromUrl(getFullFileUrl(filePath), getFileName(filePath))
      const convertedFile = await convertFile({
        file: fetchedFile,
        signal: abortController.value.signal
      })
      if (convertedFile) filetoPreview.value = URL.createObjectURL(new Blob([convertedFile]))
    } catch (e) {
      toastError({ detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi xem trước file' })
    } finally {
      isProcessFetchAndConverExternalFile.value = false
    }
  } else filetoPreview.value = getFullFileUrl(filePath)
}

const handleSubtaskDeleted = () => {
  toastSucceed({
    summary: 'Đã xóa tất cả đầu công việc. Chuyển về danh sách công việc.'
  })
  router.replace('/task/list')
}
</script>

<template>
  <div>
    <div class="card">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span
            class="icon-[icon-park-solid--back] text-primary shrink-0 cursor-pointer"
            @click="goBackToList"
            title="Quay lại danh sách công việc"
          >
          </span>
          <input
            ref="taskNameInputRef"
            :value="localTaskName"
            @blur="handleUpdateTaskName"
            @keydown.enter="handleEnterKey"
            :title="localTaskName"
            :class="[
              '[field-sizing:content] min-w-0 rounded px-2 py-1 text-xl font-semibold',
              editingTaskName
                ? 'border-primary focus:border-primary cursor-text border focus:outline-none'
                : 'cursor-default border-none bg-transparent focus:outline-none'
            ]"
            :style="
              editingTaskName
                ? {}
                : {
                    maxWidth: '500px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }
            "
            :readonly="!editingTaskName"
            type="text"
            :placeholder="localTaskName || 'Chi tiết công việc'"
          />
          <i
            v-if="canEditTask && !editingTaskName"
            class="icon-[mynaui--edit] flex-shrink-0 cursor-pointer text-xl"
            @click="editingTaskName = true"
          />
        </div>
        <Button
          v-if="canEditTask"
          label="Thêm đầu công việc"
          class="shrink-0"
          @click="addSubTaskModalRef?.openModal()"
        />
      </div>
      <CreateSubtask ref="addSubTaskModalRef" :task-id="taskId" />
      <div v-if="taskData" class="">
        <TaskAvatarGroup :data="taskData" :readonly="!canEditTask" />
      </div>
      <div class="mb-4">
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="icon-[pepicons-pencil--menu] text-xl"></span>
            <h3 class="text-lg font-semibold">Mô tả</h3>
            <i
              v-if="canEditTask && !editingTaskContent"
              class="icon-[mynaui--edit] cursor-pointer text-xl"
              @click="
                () => {
                  originalTaskContent = localTaskContent
                  editingTaskContent = true
                }
              "
            />
          </div>
          <textarea
            v-if="editingTaskContent"
            ref="taskContentInputRef"
            :value="localTaskContent"
            @blur="handleUpdateTaskContent"
            @keydown.enter="handleDescriptionEnterKey"
            class="border-primary focus:border-primary w-full rounded-lg border p-2 focus:outline-none"
            rows="4"
            maxlength="250"
          ></textarea>
          <span v-else class="rounded-lg leading-relaxed break-words whitespace-pre-wrap">
            {{ taskData?.content || 'Chưa có mô tả công việc' }}
          </span>
        </div>
      </div>
      <div class="mb-4">
        <div class="flex items-center gap-2">
          <AppReferenceFile
            ref="fileUploadModalRef"
            v-model="currentSelectedFiles"
            :tab-list="[
              { label: 'Từ văn bản', value: 'fromDoc' },
              { label: 'Tải file', value: 'upload' }
            ]"
            @confirm="handleUpdateTaskFiles"
          >
            <template #triggerElement="{ onClick }">
              <i 
                @click="onClick"
                class="pi pi-paperclip cursor-pointer" 
                title="Cập nhật file căn cứ">
              </i>
            </template>
          </AppReferenceFile>
          <h3 class="text-lg font-semibold">File căn cứ</h3>
        </div>
        <div class="rounded-lg">
          <div v-if="taskFiles.length === 0" class="text-left">Chưa có file căn cứ</div>
          <div v-else class="space-y-2">
            <span
              v-for="(file, index) in visibleFiles"
              :key="index"
              class="hover:text-primary box flex items-center gap-2 rounded"
            >
              <span> {{ index + 1 }}. </span>
              <span
                class="cursor-pointer hover:underline"
                @click="
                  () => {
                    filetoPreview = file
                    downLoadDocumentFileViaUrl(getFullFileUrl(filetoPreview), getFileName(file))
                  }
                "
              >
                {{ getFileName(file) }}
              </span>
              <span
                v-if="isDoc(file) || isPdf(file)"
                class="pi pi-eye text-primary cursor-pointer hover:text-blue-800"
                @click="
                  () => {
                    handleChangeMainFile(file)
                    selectedFileForPreview = true
                  }
                "
              ></span>
            </span>
          </div>
          <button
            v-if="taskFiles.length > 5"
            class="text-primary cursor-pointer text-sm hover:underline"
            @click="expanded = !expanded"
          >
            {{ expanded ? 'Thu gọn' : `Xem thêm (${taskFiles.length - 5})` }}
          </button>
        </div>
      </div>
      <AppModal
        v-model:visible="selectedFileForPreview"
        :wrapper-style="{ width: '60%' }"
        title="File căn cứ"
        @close="
          () => {
            selectedFileForPreview = false
            filetoPreview = null
          }
        "
      >
        <PdfViewer
          v-if="filetoPreview"
          :src="filetoPreview"
          :loading="isProcessFetchAndConverExternalFile"
          :container-class="'h-full'"
        />
      </AppModal>

      <ListSubtask
        :subtasks="subtasks"
        :task="taskData"
        @lastSubtaskDeleted="handleSubtaskDeleted"
        class="mt-6"
      />
    </div>
  </div>
</template>
