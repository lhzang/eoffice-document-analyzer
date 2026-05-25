<script setup lang="ts">
import PriorityLevelComponent from '@/modules/indoc/components/PriorityLevelComponent.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import { PDF_FILE_TYPE } from '@/shared/constants/document'
import type { TAppTab } from '@/shared/models/common'
import type { SigningConfigVM } from '@/shared/services/api'
import { getFullFileUrl, toastError } from '@/shared/utils/common'
import { computed, ref, useTemplateRef, watchEffect, type ComputedRef } from 'vue'
import { OUT_DOCUMENT_TYPES } from '../../../../shared/models/outDoc/document'
import { hasODAction } from '../../../../shared/utils/outDoc/common'
import { useGetAvailableActions } from '../../composables/queries/useGetAvailableActions'
import { useGetDetailOutDoc } from '../../composables/queries/useGetDetailOutDoc'
import AllocateEOutDoc from '../AllocateEOutDoc.vue'
import AllocatePaperOutDoc from '../AllocatePaperOutDoc.vue'
import DetailOutDocInfo from '../DetailOutDocInfo.vue'
import ODProcessHistory from '../ODProcessHistory.vue'
import ProcessButtonsOD from '../ProcessButtonsOD.vue'
import UpdateOutDoc from '../UpdateOutDoc.vue'

type TODTabValues = 'INFO' | 'PROCESS_HISTORY' | 'ISSUE' | 'UPDATE_ISSUE_DATE'
type TAllocateEOutDoc = InstanceType<typeof AllocateEOutDoc>
type TAllocatePaperOutDoc = InstanceType<typeof AllocatePaperOutDoc>

const tab = ref<TODTabValues>('INFO')

const allocateOutDocRef = useTemplateRef<TAllocateEOutDoc | null>('allocateOutDocRef')
const allocatePaperOutDocRef = useTemplateRef<TAllocatePaperOutDoc | null>('allocatePaperOutDocRef')
const abortController = ref<AbortController | null>(null)

const documentId = ref<string | null>(null)
const isVisible = ref(false)
const isUpdatingFile = ref(false)
const replaceFile = ref<File | null>(null)
const isConvertingFile = ref(false)

const { mutateAsync: convertFile } = useConvertDocxIntoPdf({})

const handleUpdateMainFile = async (file: File | null) => {
  abortController.value?.abort()
  if (!file) replaceFile.value = null
  else if (file?.type === PDF_FILE_TYPE) {
    replaceFile.value = file
  } else {
    try {
      isConvertingFile.value = true
      abortController.value = new AbortController()
      const convertedFile = await convertFile({
        file: file,
        signal: abortController.value.signal
      })
      replaceFile.value = convertedFile ?? null
    } catch (e) {
      toastError({ detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi xem trước file' })
      replaceFile.value = null
    } finally {
      isConvertingFile.value = false
    }
  }
}

const emit = defineEmits<{
  (e: 'processedDoc'): void
}>()

const { data: availableActions, isLoading: isGettingActions } = useGetAvailableActions(
  () => documentId.value!,
  {
    enabled: () => !!documentId.value,
    gcTime: 0
  }
)

const refetchDetailDoc = () => {
  refetch()
}

const handleSubmitAllocate = (provider: SigningConfigVM) => {
  if (detailOutDoc?.value?.outDocType === OUT_DOCUMENT_TYPES.paper) {
    allocatePaperOutDocRef.value?.triggerSubmit(provider)
  } else {
    allocateOutDocRef.value?.triggerSubmit(provider)
  }
}

watchEffect(() => {
  if (availableActions?.value) {
    if (hasODAction(availableActions.value, 'ISSUED')) {
      return (tab.value = 'ISSUE')
    }
    if (hasODAction(availableActions.value, 'REISSUED')) {
      return (tab.value = 'UPDATE_ISSUE_DATE')
    }
  }
})

const reset = () => {
  tab.value = 'INFO'
  documentId.value = null
  isUpdatingFile.value = false
  isConvertingFile.value = false
  replaceFile.value = null
}
const processCloseModal = () => {
  isVisible.value = false
  reset()
}

const {
  data: detailOutDoc,
  isLoading: isGettingDocInfo,
  error: getDetailDocError,
  refetch
} = useGetDetailOutDoc(() => documentId?.value!, {
  enabled: () => !!documentId?.value
})

const tabList: ComputedRef<TAppTab<TODTabValues>[]> = computed(() => {
  const tabList = [
    {
      label: 'Thông tin văn bản',
      value: 'INFO' as TODTabValues
    },
    {
      label: 'Lịch sử xử lý',
      value: 'PROCESS_HISTORY' as TODTabValues
    }
  ]
  if (availableActions?.value && hasODAction(availableActions?.value, 'ISSUED')) {
    tabList.push({
      label: 'Cấp số',
      value: 'ISSUE' as TODTabValues
    })
  } else if (availableActions?.value && hasODAction(availableActions?.value, 'REISSUED')) {
    tabList.push({
      label: 'Cập nhật ngày',
      value: 'UPDATE_ISSUE_DATE' as TODTabValues
    })
  }
  return tabList
})

const handleReloadWhenDocProcessed = () => {
  emit('processedDoc')
  processCloseModal()
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) reset()
}

const handleAfterAllocate = () => {
  processCloseModal()
  emit('processedDoc')
}

const handleAfterUpdateDoc = () => {
  isUpdatingFile.value = false
  processCloseModal()
  emit('processedDoc')
}

defineExpose({
  openModal: (id: string) => {
    documentId.value = id
    isVisible.value = true
  },
  closeModal: processCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    v-on:update:visible="handleVisibleChange"
    :wrapper-style="{ width: '99%', height: '99%', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    :is-loading="isGettingDocInfo || isGettingActions"
  >
    <template #header>
      <div class="text-primary flex items-center gap-4 text-xl font-semibold">
        {{ detailOutDoc?.subject }}
        <PriorityLevelComponent
          v-if="detailOutDoc?.priority"
          :priority="detailOutDoc?.priority"
          :exclude-priorities="['NORMAL']"
        />
      </div>
    </template>
    <div v-if="getDetailDocError" class="flex h-full items-center justify-center overflow-auto">
      {{
        getDetailDocError?.response?.data?.detail ??
        getDetailDocError?.message ??
        'Có lỗi xảy ra khi lấy thông tin văn bản'
      }}
    </div>

    <Transition v-else name="slide-away" mode="out-in">
      <UpdateOutDoc
        v-if="isUpdatingFile && detailOutDoc"
        :detail-out-doc="detailOutDoc"
        @cancel-update="isUpdatingFile = false"
        @document-processed="handleAfterUpdateDoc"
      ></UpdateOutDoc>
      <template v-else>
        <div class="flex h-full flex-col justify-between overflow-auto" v-if="detailOutDoc">
          <div class="flex h-[calc(100%_-_50px)] gap-x-6">
            <!-- preview container -->
            <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
              <PdfViewer
                :src="replaceFile ?? getFullFileUrl(detailOutDoc?.documentFiles?.lastestSignedFile)"
                :loading="isConvertingFile"
                :support-multiple-download="!isUpdatingFile"
                :document-info="detailOutDoc"
              />
            </div>
            <!-- action container -->
            <div class="border-shadow relative flex h-full w-1/2 flex-col overflow-auto 2xl:w-3/5">
              <AppTabs
                :tab-list="tabList"
                v-model:model-value="tab"
                class="sticky top-0 z-99 bg-[var(--p-overlay-modal-background]"
              />
              <div class="h-full border-t border-[#DFE5EF]">
                <DetailOutDocInfo
                  v-if="tab === 'INFO'"
                  :detail-document="detailOutDoc"
                  @addedDestinations="refetchDetailDoc"
                  @addedRelatedFiles="refetchDetailDoc"
                />
                <ODProcessHistory
                  v-if="tab === 'PROCESS_HISTORY'"
                  :document-id="detailOutDoc?.id"
                />
                <template v-if="tab === 'ISSUE'">
                  <AllocateEOutDoc
                    v-if="detailOutDoc?.outDocType === OUT_DOCUMENT_TYPES.digital"
                    ref="allocateOutDocRef"
                    :detail-document="detailOutDoc"
                    @issuedDoc="handleAfterAllocate"
                  />
                  <AllocatePaperOutDoc
                    v-if="detailOutDoc?.outDocType === OUT_DOCUMENT_TYPES.paper"
                    ref="allocatePaperOutDocRef"
                    @updateMainFile="handleUpdateMainFile"
                    :detail-document="detailOutDoc"
                    @issuedDoc="handleAfterAllocate"
                  />
                </template>
              </div>
            </div>
          </div>
          <!-- button container -->
          <ProcessButtonsOD
            v-if="detailOutDoc && availableActions"
            :availableActions
            :detailOutDoc="detailOutDoc"
            @document-processed="handleReloadWhenDocProcessed"
            @update-file="isUpdatingFile = true"
            @submit-allocate="handleSubmitAllocate"
            @re-isssue="isVisible = false"
          />
        </div>
      </template>
    </Transition>
  </AppModal>
</template>
<style lang="css" scoped>
.slide-away-enter-active,
.slide-away-leave-active {
  transition: all 0.25s ease-out;
}

.slide-away-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-away-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
</style>
