<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import type { SubtaskReportVM, SubtaskVM, TaskVM } from '@/shared/services/api'
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
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useReportSubtask } from '../composable/subtask/useReportSubtask'
import { taskPermissionCheck } from '../utils/taskPermissionCheck'

interface Props {
  subtask: SubtaskVM
  task?: TaskVM
}

defineOptions({
  name: 'TaskReport'
})

const props = defineProps<Props>()

const { isSubtaskExecutor, isTaskLeader } = taskPermissionCheck()
const queryClient = useQueryClient()

const reportFiles = ref<File[]>([])
const filetoPreview = ref<string | null>(null)
const selectedFileForPreview = ref(false)

const expandedReports = ref<Record<number, boolean>>({})

const abortController = ref<AbortController | null>(null)
const isProcessFetchAndConverExternalFile = ref(false)

const getVisibleFiles = (reportIndex: number, report: SubtaskReportVM) => {
  const files = Array.from(report.files ?? [])

  if (expandedReports.value[reportIndex]) {
    return files
  }

  return files.slice(0, 5)
}

const { mutate: reportSubtask, isPending: isReporting } = useReportSubtask()
const { mutateAsync: convertFile } = useConvertDocxIntoPdf()

const reportSchema = toTypedSchema(
  z.object({
    reportContent: z.string({ error: MSG_REQUIRED_FIELD }).min(1, { error: MSG_REQUIRED_FIELD })
  })
)

const { handleSubmit, errors, handleReset } = useForm({
  validationSchema: reportSchema
})

const canReport = computed(() => {
  return isSubtaskExecutor(props.subtask) || isTaskLeader(props.task)
})

const onSubmit = handleSubmit((formData) => {
  const filesToSend = Array.isArray(reportFiles.value) ? reportFiles.value : []

  reportSubtask(
    {
      subtaskId: props.subtask.id,
      request: { content: formData.reportContent },
      files: filesToSend
    },
    {
      onSuccess: () => {
        toastSucceed({ summary: 'Gửi báo cáo thành công!' })
        handleReset()
        reportFiles.value = []
        if (props.task?.id) {
          queryClient.invalidateQueries({ queryKey: ['getTaskById', props.task.id] })
        }
        queryClient.invalidateQueries({ queryKey: ['getListTasks'] })
      },
      onError: (error) => {
        notifyError(error as TServerError, 'Lỗi khi gửi báo cáo')
      }
    }
  )
})

const handleChangeReportFile = async (filePath: string) => {
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
</script>

<template>
  <div class="w-[50%] px-6">
    <div>
      <div v-if="canReport" class="card mt-6">
        <form @submit="onSubmit" class="text-primary">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <AppTextarea
                name="reportContent"
                label="Nội dung báo cáo"
                placeholder="Nhập nội dung báo cáo..."
                :limitNumber="250"
                required
                :error-message="errors.reportContent"
              />
            </div>
            <div class="shrink-0">
              <Button type="submit" :loading="isReporting" label="Báo cáo" severity="primary" />
            </div>
          </div>
          <AppFileInput
            name="files"
            :multiple="true"
            accept=".pdf, .docx"
            multipleFileSelectMode="append"
            @change="(files) => (reportFiles = files || [])"
          >
            <template #trigger-element="{ triggerFunction }">
              <div class="inline-flex cursor-pointer items-center gap-1" @click="triggerFunction">
                <span class="icon-[icon-park-outline--upload-logs] text-lg text-[#9DA2AE]"></span>
                <span class="text-secondary font-semibold underline"> File báo cáo (nếu có) </span>
              </div>
            </template>
          </AppFileInput>
        </form>
      </div>
      <div class="mt-4 space-y-4">
        <div
          v-if="!subtask?.reports || subtask.reports.length === 0"
          class="text-base text-gray-500"
        >
          Chưa có báo cáo
        </div>
        <div v-else class="max-h-64 space-y-2 overflow-y-auto">
          <div
            v-for="(report, index) in subtask?.reports || []"
            :key="index"
            class="card flex items-start gap-3"
          >
            <Avatar
              :label="report.actor.name.charAt(0).toUpperCase()"
              :style="{ backgroundColor: '#5b8dee', color: 'white', flexShrink: 0 }"
              shape="circle"
              size="small"
              :title="report.actor.name"
            />
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center justify-between gap-2">
                <span class="text-base font-medium">{{ report.actor.name }}</span>
                <span class="text-xs text-gray-400">{{
                  new Date(report.occurredOn).toLocaleString('vi-VN')
                }}</span>
              </div>
              <div class="mb-2 text-base wrap-break-word text-gray-700">{{ report.content }}</div>
              <div
                v-if="report.files && Array.from(report.files).length > 0"
                class="flex flex-col flex-wrap gap-2"
              >
                <div
                  v-for="(file, fIndex) in getVisibleFiles(index, report)"
                  :key="fIndex"
                  class="hover:text-primary flex cursor-pointer items-center gap-2 rounded"
                >
                  <span>{{ fIndex + 1 }}.</span>
                  <span
                    class="hover:underline"
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
                    class="pi pi-eye text-primary hover:text-blue-800"
                    @click="
                      () => {
                        handleChangeReportFile(file)
                        selectedFileForPreview = true
                      }
                    "
                  ></span>
                </div>
                <button
                  v-if="Array.from(report.files).length > 5"
                  class="text-primary flex cursor-pointer text-sm hover:underline"
                  @click="expandedReports[index] = !expandedReports[index]"
                >
                  {{
                    expandedReports[index]
                      ? 'Thu gọn'
                      : `Xem thêm (${Array.from(report.files).length - 5})`
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- PDF Preview Modal -->
      <AppModal
        v-model:visible="selectedFileForPreview"
        :wrapper-style="{ width: '60%' }"
        title="File báo cáo"
        @close="
          () => {
            selectedFileForPreview = false
            filetoPreview = null
          }
        "
      >
        <PdfViewer v-if="filetoPreview" :src="filetoPreview" :container-class="'h-full'" />
      </AppModal>
    </div>
  </div>
</template>
