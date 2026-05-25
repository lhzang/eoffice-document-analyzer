<script setup lang="ts">
import { Image } from 'primevue'
import { ref } from 'vue'
import { useConvertDocxIntoPdf } from '../composables/queries/common/useConvertDocxIntoPdf'
import { isDoc, isImage, isPdf } from '../utils/check'
import { createFileFromUrl, fetchImageWithAuth, getFullFileUrl, toastError } from '../utils/common'
import PdfViewer from './PdfViewer.vue'
import AppModal from './modals/AppModal.vue'

const { mutateAsync: convertFile } = useConvertDocxIntoPdf()

const isShowModal = ref(false)

const fileName = ref<string>()
const relativeUrl = ref<string>()
const previewUrl = ref<string>()
const isLoading = ref(false)

const abortController = ref<AbortController | null>(null)

const reset = () => {
  if (previewUrl.value && relativeUrl.value && isDoc(relativeUrl.value)) {
    URL.revokeObjectURL(previewUrl.value)
  }
  fileName.value = undefined
  relativeUrl.value = undefined
  previewUrl.value = undefined
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    abortController.value?.abort()
    abortController.value = null
    reset()
  }
}

defineExpose({
  openModal: async (url: string, name?: string) => {
    if (!url || !(isPdf(url) || isDoc(url) || isImage(url))) {
      return toastError({ detail: 'Xem trước file không khả dụng' })
    }
    relativeUrl.value = url
    fileName.value = name ?? url?.split('/').pop() ?? 'file'
    isShowModal.value = true
    if (isDoc(url)) {
      try {
        isLoading.value = true
        abortController.value = new AbortController()
        const fetchedFile = await createFileFromUrl(getFullFileUrl(url), name)
        const convertedFile = await convertFile({
          file: fetchedFile,
          signal: abortController.value.signal
        })
        if (convertedFile) previewUrl.value = URL.createObjectURL(new Blob([convertedFile]))
      } catch (e) {
        toastError({ detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi xem trước file' })
        relativeUrl.value = undefined
        fileName.value = undefined
        isShowModal.value = false
      } finally {
        isLoading.value = false
      }
    } else if (isImage(url)) {
      previewUrl.value = await fetchImageWithAuth(getFullFileUrl(url))
    } else previewUrl.value = getFullFileUrl(url)
  },
  closeModal: () => {
    isShowModal.value = false
  }
})
</script>
<template>
  <!-- :wrapper-style="{
      width: '600px',
      height: isImage(relativeUrl) ? 'auto' : '90%',
      overflow: 'hidden'
    }" -->
  <AppModal
    v-if="relativeUrl"
    class="h-4/5 w-full overflow-hidden md:w-[600px] lg:h-9/10 lg:w-[900px]"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    v-model:visible="isShowModal"
    @update:visible="handleVisibleChange"
    title="Xem trước file"
    :footer="false"
    :is-loading="isLoading"
  >
    <div class="border-shadow relative h-full overflow-auto">
      <PdfViewer
        v-if="relativeUrl && previewUrl && (isPdf(relativeUrl) || isDoc(relativeUrl))"
        :src="previewUrl"
        :src-file-name="fileName"
      />
      <Image
        v-if="relativeUrl && previewUrl && isImage(relativeUrl)"
        class="flex h-full w-full items-center justify-center"
        :image-class="'max-w-full max-h-full object-contain'"
        :src="previewUrl"
      />
    </div>
  </AppModal>
</template>
