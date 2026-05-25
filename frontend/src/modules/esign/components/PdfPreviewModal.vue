<script setup lang="ts">
import PdfViewer from '@/shared/components/PdfViewer.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { defineExpose, ref } from 'vue'

const previewFile = ref<string | null>(null)
const fileName = ref<string | null>(null)

const visible = ref(false)

function openPreview(fileUrl: string, name: string) {
  fileName.value = name
  previewFile.value = fileUrl
  visible.value = true
}

function closePreview() {
  visible.value = false
  previewFile.value = null
  fileName.value = null
}

defineExpose({
  openPreview
})
</script>

<template>
  <AppModal
    :wrapper-style="{ width: '93%', height: 'calc(100vh - 20px)' }"
    :classContent="'!overflow-y-hidden'"
    v-model:visible="visible"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <span class="text-lg font-semibold">{{ fileName }}</span>
        <button
          @click="closePreview"
          class="text-xl font-bold text-gray-500 hover:text-gray-700"
        ></button>
      </div>
    </template>

    <div class="relative h-[80vh] w-full px-5 md:px-20">
      <PdfViewer
        v-if="visible && previewFile"
        containerClass="h-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        :src="previewFile"
        :srcFileName="fileName ?? undefined"
        class="h-full w-full scroll-auto border-0 outline-0"
      />
    </div>
  </AppModal>
</template>
