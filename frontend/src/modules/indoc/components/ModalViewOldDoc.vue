<script setup lang="ts">
import {
  DETAIL_DOCUMENT_TABS,
  type TDetailDocumentTabs
} from '@/modules/indoc/composables/useTabModalDetail'
import AppTabs from '@/shared/components/AppTabs.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import type { TAppTab } from '@/shared/models/common'
import { getFullFileUrl } from '@/shared/utils/common'
import { provide, ref, watchEffect } from 'vue'
import { useGetInDocumentDetail } from '../composables/queries/useGetInDocumentDetail'
import DetailInfoInDoc from './DetailInfoInDoc.vue'
import PriorityLevelComponent from './PriorityLevelComponent.vue'

const isVisible = ref(false)
const documentId = ref<string | null>(null)

const tab = ref<TDetailDocumentTabs>('info')

const tabList: TAppTab<TDetailDocumentTabs>[] = [
  {
    label: DETAIL_DOCUMENT_TABS.info,
    value: 'info' as TDetailDocumentTabs
  }
]

const previewFile = ref<string | File | null>()

const reset = () => {
  tab.value = 'info'
  documentId.value = null
}
const processCloseModal = () => {
  isVisible.value = false
  reset()
}

const queryResults = useGetInDocumentDetail(() => documentId.value!, {
  enabled: () => !!documentId.value
})
const {
  data: documentDetail,
  isLoading: isGettinDocumentData,
  error: getDetailDocError
} = queryResults

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    processCloseModal()
  }
}

defineExpose({
  openModal: (id: string) => {
    documentId.value = id
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})

watchEffect(() => {
  if (queryResults?.data?.value?.mainFile) {
    previewFile.value = getFullFileUrl(queryResults?.data?.value?.mainFile)
  }
  provide('documentDetailID', queryResults)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '98%', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="text-primary flex items-center gap-4 text-xl font-semibold">
        {{ documentDetail?.documentCode }}
        <PriorityLevelComponent
          class="ml-[10px]"
          v-if="documentDetail?.priority"
          :priority="documentDetail?.priority"
          :exclude-priorities="['NORMAL']"
        />
      </div>
    </template>
    <div
      v-if="isGettinDocumentData"
      class="flex h-[calc(100%_-_40px)] w-full items-center justify-center"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="documentDetail" class="flex h-[calc(100%_-_50px)] gap-x-6">
      <div class="border-shadow relative h-full w-1/2 overflow-auto 2xl:w-3/5">
        <div
          v-if="documentDetail?.mainFileName && documentDetail?.mainFile === null"
          class="flex h-[calc(100%_-_50px)] w-full items-center justify-center"
        >
          {{ documentDetail?.mainFileName }}
        </div>
        <PdfViewer v-else :src="previewFile" />
      </div>
      <div class="border-shadow flex h-full w-1/2 flex-col overflow-auto 2xl:w-3/5">
        <AppTabs
          :tab-list="tabList"
          v-model:model-value="tab"
          class="sticky top-0 z-99 bg-[var(--p-overlay-modal-background]"
        />

        <div class="h-full overflow-auto border-t border-[#DFE5EF]">
          <DetailInfoInDoc v-if="tab === 'info'" :documentDetail="documentDetail" />
        </div>
      </div>
    </div>

    <div v-if="getDetailDocError" class="flex h-full w-full items-center justify-center">
      {{
        getDetailDocError?.response?.data?.detail ??
        getDetailDocError?.message ??
        'Có lỗi khi lấy thông tin văn bản'
      }}
    </div>
  </AppModal>
</template>

<style scoped></style>
