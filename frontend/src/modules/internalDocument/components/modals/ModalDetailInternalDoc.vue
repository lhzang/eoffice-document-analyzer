<script setup lang="ts">
import PriorityLevelComponent from '@/modules/indoc/components/PriorityLevelComponent.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import type { TAppTab } from '@/shared/models/common'
import { getFullFileUrl } from '@/shared/utils/common'
import { computed, ref, type ComputedRef } from 'vue'
import { hasODAction } from '../../../../shared/utils/outDoc/common'
import { useGetAvailableActions } from '../../composables/queries/useGetAvailableActions'
import { useGetDetailInternalDoc } from '../../composables/queries/useGetDetailInternalDoc'
import DetailInternalDocInfo from '../DetailInternalDocInfo.vue'
import InternalProcessHistory from '../InternalDocProcessHistory.vue'
import ProcessButtonsInternalDoc from '../ProcessButtonsInternalDoc.vue'

type TODTabValues = 'INFO' | 'PROCESS_HISTORY'

const tab = ref<TODTabValues>('INFO')

const documentId = ref<string | null>(null)
const isVisible = ref(false)

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

const reset = () => {
  tab.value = 'INFO'
  documentId.value = null
}
const processCloseModal = () => {
  isVisible.value = false
  reset()
}

const {
  data: detailInternalDoc,
  isLoading: isGettingDocInfo,
  error: getDetailDocError,
  refetch
} = useGetDetailInternalDoc(() => documentId?.value!, {
  enabled: () => !!documentId?.value
})

const tabList: ComputedRef<TAppTab<TODTabValues>[]> = computed(() => {
  if (availableActions?.value && hasODAction(availableActions?.value, 'ISSUED')) {
    return [
      {
        label: 'Thông tin văn bản',
        value: 'INFO'
      },
      {
        label: 'Lịch sử xử lý',
        value: 'PROCESS_HISTORY'
      }
    ]
  }
  return [
    {
      label: 'Thông tin văn bản',
      value: 'INFO'
    },
    {
      label: 'Lịch sử xử lý',
      value: 'PROCESS_HISTORY'
    }
  ]
})

const handleReloadWhenDocProcessed = () => {
  emit('processedDoc')
  processCloseModal()
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) reset()
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
        {{ detailInternalDoc?.subject }}
        <PriorityLevelComponent
          v-if="detailInternalDoc?.priority"
          :priority="detailInternalDoc?.priority"
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

    <div class="flex h-full flex-col justify-between overflow-auto" v-if="detailInternalDoc">
      <div class="flex h-[calc(100%_-_50px)] gap-x-6">
        <!-- preview container -->
        <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
          <PdfViewer
            :src="getFullFileUrl(detailInternalDoc?.documentFiles?.lastestSignedFile)"
            support-multiple-download
            :document-info="detailInternalDoc"
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
            <DetailInternalDocInfo
              v-if="tab === 'INFO'"
              :detail-document="detailInternalDoc"
              @addedDestinations="refetchDetailDoc"
              @addedRelatedFiles="refetchDetailDoc"
            />
            <InternalProcessHistory
              v-if="tab === 'PROCESS_HISTORY'"
              :document-id="detailInternalDoc?.id"
            />
          </div>
        </div>
      </div>
      <!-- button container -->
      <ProcessButtonsInternalDoc
        v-if="detailInternalDoc && availableActions"
        :availableActions
        :detailInternalDoc="detailInternalDoc"
        @document-processed="handleReloadWhenDocProcessed"
        @re-isssue="isVisible = false"
      />
    </div>
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
