<script setup lang="ts" generic="IsMulti extends boolean">
import { isImage, isPdf } from '@/shared/utils/check'
import { ref } from 'vue'
import ModalPreviewFile from '../ModalPreviewFile.vue'
import AppModal from '../modals/AppModal.vue'
import PdfViewer from '../PdfViewer.vue'

type TProps = {
  // placeholder?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  fileUrl: string
  fileName: string
  label: string
}

type ModalType = InstanceType<typeof AppModal>
type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

const {
  // placeholder = 'Tải file lên...',
  required,
  readOnly,
  disabled,
  fileUrl,
  fileName,
  label
} = defineProps<TProps>()

const isVisible = ref(false)

const previewModalRef = ref<TPreviewModalRef | null>(null)

const handlePreviewFile = () => {
  previewModalRef?.value?.openModal(fileUrl, fileName)
}
</script>
<template>
  <div class="h-full w-full" v-tippy="fileName">
    <label v-if="label" class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <div
      :class="`rounded-md border border-solid border-[var(--p-inputtext-border-color)] py-[var(--p-inputtext-padding-y)] pl-[.75rem] ${disabled ? 'hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} transition duration-200 ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
      :style="{
        paddingInlineEnd: 'calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size))'
      }"
    >
      <div
        class="truncate overflow-hidden whitespace-nowrap text-[var(--p-inputtext-disabled-color)]"
      >
        <template v-if="fileName">
          <div
            class="truncate overflow-hidden whitespace-nowrap"
            v-if="isImage(fileName) || isPdf(fileName)"
          >
            {{ fileName }}
          </div>
          <a v-else :href="fileUrl" target="_blank" rel="noopener noreferrer">{{ fileName }}</a>
        </template>
        <div v-else>--</div>
      </div>
      <div
        v-if="isImage(fileName) || isPdf(fileName)"
        class="icon-[mdi--eye] hover:text-primary pointer absolute inset-y-1/2 right-2 -translate-y-1/2 text-xl text-[#9DA2AE] transition-all"
        @click="handlePreviewFile"
      ></div>
    </div>
    <!-- preview modal -->
    <ModalPreviewFile ref="previewModalRef" />

    <AppModal
      v-model:visible="isVisible"
      :wrapper-style="{ width: '93%', height: 'calc(100vh - 20px)' }"
    >
      <PdfViewer
        v-if="isVisible && fileUrl && isPdf(fileName)"
        containerClass="h-full shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
        :src="fileUrl"
        :srcFileName="fileName ?? undefined"
        class="h-full w-full scroll-auto border-0 outline-0"
      />
    </AppModal>
  </div>
</template>
