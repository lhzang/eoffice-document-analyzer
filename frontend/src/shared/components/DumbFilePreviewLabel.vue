<script setup lang="ts">
import { computed } from 'vue'
import { isDoc, isImage, isPdf } from '../utils/check'
import {
  downLoadDocumentFileViaUrl,
  getFileName,
  getFullFileUrl,
  toastError,
  toastWarning
} from '../utils/common'
import AppLongText from './AppLongText.vue'
type TProps = {
  fileName?: string
  relativeUrl: string
  showPreview?: boolean
  labelClass?: string
}

const emit = defineEmits<{
  (e: 'showPreview', relativeUrl: string, fileName?: string): void
}>()

const { relativeUrl, showPreview = true, fileName, labelClass } = defineProps<TProps>()
const name = computed(() => fileName ?? getFileName(relativeUrl) ?? 'file')
const fullUrl = computed(() => getFullFileUrl(relativeUrl))
const isPreviewAble = computed(
  () => showPreview && (isPdf(relativeUrl) || isDoc(relativeUrl) || isImage(relativeUrl))
)

const downloadFile = () => {
  try {
    toastWarning({
      detail: 'Đang tải file, vui lòng chờ...'
    })
    downLoadDocumentFileViaUrl(fullUrl.value, name?.value)
  } catch (error) {
    toastError({
      detail: error instanceof Error ? error?.message : 'Lỗi khi tải file'
    })
  }
}
</script>
<template>
  <div class="flex w-full items-center gap-2">
    <div
      @click="downloadFile"
      class="text-primary min-w-0 flex-1 text-right italic underline"
      :class="labelClass"
    >
      <AppLongText :text="name" :splice-length="50" :is-show-read-more="false" is-show-tooltips />
    </div>
    <div
      v-if="isPreviewAble"
      @click="emit('showPreview', relativeUrl, fileName)"
      class="icon-[mdi--eye] text-primary shrink-0 cursor-pointer text-2xl"
    ></div>
  </div>
</template>
