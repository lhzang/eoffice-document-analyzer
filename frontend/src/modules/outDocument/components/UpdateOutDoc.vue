<script setup lang="ts">
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { usePreviewCreateDoc } from '@/shared/composables/queries/outdoc/usePreviewCreateDoc'
import {
  APP_DOCUMENT_TYPES,
  DOCUMENT_TYPES,
  DOCX_FILE_TYPE,
  PDF_FILE_TYPE,
  URGENCY_LEVELS
} from '@/shared/constants/document'
import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import type { FilesBySource } from '@/shared/models/document'
import type {
  DetailDocumentVM,
  InDocumentFileVM,
  OutDocumentFileVM,
  RelatedFileRequestTypeEnum,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'
import {
  createFileFromUrl,
  getFileName,
  getFullFileUrl,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import { mappingRelatedFromDocType } from '@/shared/utils/document'
import { useDropZone } from '@vueuse/core'
import { DateTime } from 'luxon'
import { Button } from 'primevue'
import { onUnmounted, ref, watch, watchEffect } from 'vue'
import { useUpdateOutDoc } from '../composables/queries/useUpdateOutDoc'

type TProps = {
  detailOutDoc: DetailDocumentVM
}

const abortController = ref<AbortController | null>(null)

const { detailOutDoc } = defineProps<TProps>()
const isLoadingFile = ref<boolean>(false)

const dropZoneRef = ref<HTMLDivElement>()
const uploadedFile = ref<File>()
const previewFile = ref<File | null>(null)
const annexesFiles = ref<File[]>()
const relatedFiles = ref<FilesBySource>()

const emit = defineEmits<{
  (e: 'documentProcessed'): void
  (e: 'cancelUpdate'): void
}>()

const preparePreviewFile = (previewFile: File) => {
  if (!detailOutDoc?.issueUnit?.id || !previewFile) return
  return {
    metadataRequest: {
      unitIds: detailOutDoc?.jointUnits?.map((unit, index) => ({
        index: index,
        unitId: unit?.id
      })),
      issuedUnitId: detailOutDoc?.issueUnit?.id,
      haveCreatorSign: !!detailOutDoc?.signFlowVM?.flowStepVMS?.some(
        (step) => step?.signType === OD_SIGN_TYPES.creator
      ),
      processingSteps: {
        steps: (detailOutDoc?.signFlowVM?.flowStepVMS ?? [])
          ?.filter((step) => step?.signType !== OD_SIGN_TYPES.creator)
          .map((step, idx) => {
            if (
              step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
              step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
              step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
              step?.signType === OD_SIGN_TYPES.staffCollaborator
            ) {
              return {
                signers: (step?.userApproverVMs ?? [])?.map((signer) => ({
                  signerIndex: signer?.userIndex,
                  staffId: signer?.leader?.id
                })),
                stepName: step?.signType,
                stepIndex: idx
              }
            }
            return {
              signers: step?.userApproverVMs?.[0]?.leader?.id
                ? [
                    {
                      signerIndex: 0,
                      staffId: step?.userApproverVMs?.[0]?.leader?.id
                    }
                  ]
                : [],
              stepName: step?.signType!,
              stepIndex: idx
            }
          })
      },
      isEnglish: detailOutDoc?.isEnglish,
      type: DOCUMENT_TYPES.outDoc
    },
    file: previewFile
  }
}
const handleImportDocument = (files: File[] | null) => {
  const dropFile = files?.[0] || null
  handleFileChange(dropFile)
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleImportDocument,
  // specify the types of data to be received.
  dataTypes: [DOCX_FILE_TYPE, PDF_FILE_TYPE],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
})

const { mutateAsync: previewDoc, isPending: isGettingPreviewDoc } = usePreviewCreateDoc()
const { mutate: updateDocument, isPending: isUpdatingDocument } = useUpdateOutDoc({
  onSuccess: () => {
    toastSucceed({ detail: 'Cập nhật văn bản thành công' })
    emit('documentProcessed')
  }
})
watchEffect(() => {
  console.log(annexesFiles?.value, 'xxxxxxxxxxxxxxxx')
})
const handleUpdateOutDoc = () => {
  console.log(
    {
      documentId: detailOutDoc?.id,
      mainOriginFile: uploadedFile?.value,
      annexes: annexesFiles?.value ?? [],
      relatedFiles: [
        ...(relatedFiles.value?.fromDoc ?? [])?.map((relatedDoc) => ({
          relatedId: relatedDoc?.id,
          type: mappingRelatedFromDocType(relatedDoc?.docType)
        })),
        ...(relatedFiles.value?.fromTask ?? [])?.map((relatedTask) => ({
          relatedId: relatedTask?.id,
          type: 'WORK_FILE' as RelatedFileRequestTypeEnum
        }))
      ],
      relatedUploadFiles: (relatedFiles.value?.upload ?? [])?.map((uploadFile) => uploadFile?.file)
    },
    'sdaffadsfdasfdasfds'
  )
  if (!uploadedFile.value)
    return toastError({
      detail: 'Vui lòng chọn văn bản thay thế'
    })
  updateDocument({
    documentId: detailOutDoc?.id,
    mainOriginFile: uploadedFile?.value,
    annexes: annexesFiles?.value ?? [],
    relatedFiles: [
      ...(relatedFiles.value?.fromDoc ?? [])?.map((relatedDoc) => ({
        relatedId: relatedDoc?.id,
        type: mappingRelatedFromDocType(relatedDoc?.docType)
      })),
      ...(relatedFiles.value?.fromTask ?? [])?.map((relatedTask) => ({
        relatedId: relatedTask?.id,
        type: 'WORK_FILE' as RelatedFileRequestTypeEnum
      }))
    ],
    relatedUploadFiles: (relatedFiles.value?.upload ?? [])?.map((uploadFile) => uploadFile?.file)
  })
}

const handleFileChange = async (file: File | null) => {
  if (!file) return
  abortController.value = new AbortController()
  const prepareData = preparePreviewFile(file)
  if (prepareData) {
    const resFile = await previewDoc({ ...prepareData, signal: abortController.value.signal })
    if (resFile) {
      previewFile.value = resFile
      uploadedFile.value = file
    }
  }
}

watch(
  () => detailOutDoc,
  async (detailOutDoc) => {
    try {
      isLoadingFile.value = true

      if (detailOutDoc) {
        const relatedUploadFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter((file) => file?.type === 'UPLOADED') as UploadedFileVM[]
        const relatedDocFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter(
          (file) =>
            file?.type === 'INDOC' || file?.type === 'OUTDOC' || file?.type === 'INTERNAL_DOC'
        ) as InDocumentFileVM[] | OutDocumentFileVM[]
        const relatedWorkFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter((file) => file?.type === 'WORK') as WorkFileVM[]

        const promiseannexesFiles = Promise.allSettled(
          (detailOutDoc?.documentFiles?.annexes ?? []).map((p) =>
            createFileFromUrl(getFullFileUrl(p), getFileName(p))
          )
        ).then((results) => {
          const fulfilled = results.filter((r) => r.status === 'fulfilled')
          const rejected = results.filter((r) => r.status === 'rejected')
          if (rejected.length) console.log(rejected.map((r) => r.reason))
          annexesFiles.value = fulfilled.map((r) => r.value)
        })

        const promiseRelatedFiles = Promise.allSettled(
          (relatedUploadFiles ?? []).map((f) =>
            createFileFromUrl(getFullFileUrl(f?.path), getFileName(f?.path))
          )
        ).then((results) => {
          const fulfilled = results.filter((r) => r.status === 'fulfilled')
          const rejected = results.filter((r) => r.status === 'rejected')
          if (rejected.length) console.log(rejected.map((r) => r.reason))

          relatedFiles.value = {
            fromDoc: (relatedDocFiles ?? []).map((file) => ({
              type: 'fromDoc',
              id: file?.documentId,
              name: file?.documentCode,
              docType:
                file?.type === 'INDOC'
                  ? APP_DOCUMENT_TYPES.inDoc
                  : file?.type === 'OUTDOC'
                    ? APP_DOCUMENT_TYPES.outDoc
                    : APP_DOCUMENT_TYPES.internalDoc
            })),
            upload: fulfilled.map((r) => ({
              type: 'upload',
              file: r.value
            })),
            fromTask: (relatedWorkFiles ?? []).map((file) => ({
              type: 'fromTask',
              id: file?.workId,
              name: file?.title
            }))
          }
        })
        await Promise.allSettled([promiseannexesFiles, promiseRelatedFiles])
      }
    } catch (e) {
      toastError({
        detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi lấy thông tin chi tiết văn bản'
      })
    } finally {
      isLoadingFile.value = false
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  abortController.value?.abort()
  abortController.value = null
})
</script>
<template>
  <div class="flex h-full flex-col justify-between overflow-auto">
    <div class="flex h-[calc(100%_-_50px)] gap-x-6">
      <!-- preview container -->
      <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
        <PdfViewer
          v-if="uploadedFile || isGettingPreviewDoc"
          :loading="isGettingPreviewDoc"
          :src="previewFile as File"
        />
        <div v-else class="h-full w-full"></div>
      </div>
      <!-- action container -->
      <div class="border-shadow flex h-full w-1/2 flex-col overflow-auto 2xl:w-3/5">
        <div class="text-primary w-full p-[var(--p-tabs-tab-padding)] text-center font-semibold">
          Cập nhật văn bản
        </div>
        <div class="grid grid-cols-2 gap-4 border-t border-[#DFE5EF] px-4 py-2">
          <AppTextInput
            name="documentType"
            disabled
            label="Loại văn bản"
            :model-value="'Biên bản'"
          />
          <AppTextInput
            name="urgencyLevel"
            disabled
            label="Độ khẩn"
            :model-value="
              URGENCY_LEVELS?.find((level) => level?.value === detailOutDoc?.priority)?.title
            "
          />
          <AppTextInput
            name="issueUnit"
            disabled
            label="Đơn vị cấp số đóng dấu"
            placeholder="Chọn đơn vị cấp số đóng dấu"
            :model-value="detailOutDoc?.dueDate"
          />
          <AppTextInput
            name="dueDate"
            disabled
            placeholder="Chọn ngày"
            label="Hạn trả lời"
            :model-value="
              detailOutDoc?.dueDate
                ? DateTime.fromISO(detailOutDoc?.dueDate).toFormat('dd/MM/yyyy')
                : undefined
            "
          />
          <AppTextarea
            name="subject"
            disabled
            label="Trích yếu nội dung"
            :model-value="detailOutDoc?.subject"
          />
          <AppTextarea
            name="note"
            disabled
            label="Ghi chú"
            :model-value="detailOutDoc?.description"
          />
          <AppFileInput
            name="annexesFiles"
            class="col-span-2"
            :multiple="true"
            label="File phụ lục đính kèm"
            v-model="annexesFiles"
          />
          <AppReferenceFile
            @confirm="(selectedFiles) => (relatedFiles = selectedFiles)"
            :model-value="relatedFiles"
          >
            <template #triggerElement="{ onClick }">
              <span @click="onClick" class="text-primary cursor-pointer underline">
                {{
                  `Chọn file căn cứ (${(relatedFiles?.fromDoc ?? [])?.length + (relatedFiles?.fromTask ?? [])?.length + (relatedFiles?.upload ?? [])?.length} tệp)`
                }}
              </span>
            </template>
          </AppReferenceFile>
          <KeepAlive>
            <AppFileInput
              class="col-span-2"
              name="uploadFile"
              :multiple="false"
              :model-value="uploadedFile"
              required
              label="Chọn file văn bản cập nhật"
              :accept="`${DOCX_FILE_TYPE},${PDF_FILE_TYPE}`"
              @change="handleFileChange"
              ><template #trigger-element="{ triggerFunction }">
                <div
                  class="hover:border-primary flex h-[120px] w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all"
                  :class="{
                    'border-primary': isOverDropZone
                  }"
                  ref="dropZoneRef"
                >
                  <span v-if="isGettingPreviewDoc">
                    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
                  </span>
                  <div
                    class="text-primary flex h-full w-full items-center justify-center"
                    @click="triggerFunction"
                    v-else-if="!uploadedFile"
                  >
                    Kéo thả hoặc bấm để chọn file văn bản tải lên
                  </div>
                  <div
                    class="text-primary flex h-full w-full items-center justify-center"
                    @click="triggerFunction"
                    v-else
                  >
                    {{ uploadedFile?.name }}
                  </div>
                </div>
              </template>
            </AppFileInput>
          </KeepAlive>
        </div>
      </div>
    </div>
    <div class="flex shrink-0 items-center justify-end gap-4">
      <Button outlined severity="secondary" @click="emit('cancelUpdate')">Huỷ bỏ</Button>
      <Button @click="handleUpdateOutDoc" :loading="isUpdatingDocument">Cập nhật</Button>
    </div>
  </div>
</template>
