<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { OUT_DOC_STATUS_VALUES } from '@/shared/models/outDoc/document'
import type { DetailDocumentVM } from '@/shared/services/api'
import { getFullFileUrl, handlePrintFile, toastError } from '@/shared/utils/common'
import { Button } from 'primevue'
import { ref } from 'vue'

type TProps = {
  detailOutDoc: DetailDocumentVM
}

const { detailOutDoc } = defineProps<TProps>()

const isVisible = ref(false)
const isLoading = ref(false)

const printDoc = (type: 'non-issued' | 'issued') => {
  try {
    isLoading.value = true
    if (type === 'issued') {
      if (
        detailOutDoc?.documentFiles?.lastestSignedFile &&
        detailOutDoc?.documentStatus === OUT_DOC_STATUS_VALUES.completed
      ) {
        handlePrintFile(getFullFileUrl(detailOutDoc?.documentFiles?.lastestSignedFile))
        isVisible.value = false
      }
    } else {
      if (detailOutDoc?.documentFiles?.unstampedFile) {
        handlePrintFile(getFullFileUrl(detailOutDoc?.documentFiles?.unstampedFile))
        isVisible.value = false
      }
    }
  } catch (error) {
    toastError({
      detail: error instanceof Error ? error?.message : 'Đã có lỗi xảy ra khi in văn bản'
    })
  } finally {
    isLoading.value = false
  }
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) isLoading.value = false
}

defineExpose({
  openModal: () => {
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    title="In văn bản"
    :wrapper-style="{ width: '450px', height: '200px', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
  >
    <div class="item-center flex h-full justify-between">
      <Button
        variant="contained"
        severity="primary"
        label="In bản chưa đóng dấu"
        :loading="isLoading"
        @click="printDoc('non-issued')"
      ></Button>
      <Button
        variant="contained"
        v-if="detailOutDoc?.documentStatus === OUT_DOC_STATUS_VALUES.completed"
        severity="primary"
        label="In bản đã đóng dấu"
        :loading="isLoading"
        @click="printDoc('issued')"
      ></Button>
    </div>
  </AppModal>
</template>
