<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { usePreviewCreateDoc } from '@/shared/composables/queries/outdoc/usePreviewCreateDoc'
import type { TPreviewOutDocPayload } from '@/shared/models/outDoc/document'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { Button } from 'primevue'
import { ref, watchEffect } from 'vue'

type TProps = {
  isViewonly?: boolean
}

const { isViewonly = false } = defineProps<TProps>()

const isVisible = ref(false)

const previewFile = ref<File | null>(null)
const {
  mutate: previewDoc,
  isPending: isGettingPreviewDoc,
  error
} = usePreviewCreateDoc({
  onSuccess: (file) => {
    previewFile.value = file
  }
})

const user = useUserProfileStore().user
const isReadAll = ref(false)
const emit = defineEmits<{
  (e: 'confirmRegister'): void
}>()
watchEffect(() => {
  if (error.value) {
    console.log(error.value, 'saddddđ')
  }
})
const reset = () => {
  isReadAll.value = false
  previewFile.value = null
  isVisible.value = false
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) reset()
}

const handleConfirmRegister = () => {
  isVisible.value = false
  emit('confirmRegister')
}

defineExpose({
  openModal: (previewPayload: TPreviewOutDocPayload) => {
    isVisible.value = true
    previewDoc(previewPayload)
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    v-on:update:visible="handleVisibleChange"
    class="h-4/5 w-full overflow-hidden md:w-[600px] lg:h-9/10 lg:w-[900px]"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
  >
    <template #header>
      <div v-if="isViewonly" class="text-primary text-lg font-semibold">Xem trước văn bản</div>
      <div v-else class="text-primary flex flex-col text-lg font-semibold">
        <div>
          {{
            `Thầy/Cô đang đăng ký phát hành văn bản ở
          vị trí ${user?.currentPosition?.title} -
          ${user?.currentPosition?.titleAbbr}`
          }}
        </div>
        <div>Nút Gửi đăng ký sẽ hiển thị khi Thầy/Cô kiểm tra hết toàn bộ các trang văn bản</div>
      </div>
    </template>
    <div class="flex h-full flex-col">
      <div v-if="isGettingPreviewDoc" class="relative flex h-full items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div v-else-if="error" class="border-shadow relative flex h-full items-center justify-center">
        {{ error?.response?.data?.detail ?? error?.message ?? 'Có lỗi khi xem trước văn bản' }}
      </div>
      <div v-else-if="previewFile" class="border-shadow h-full overflow-auto">
        <PdfViewer :src="previewFile" :initial-scale="'PageWidth'" @read-all="isReadAll = true" />
      </div>
      <div v-if="!isViewonly" class="mt-5 flex items-center justify-end gap-2">
        <Button
          class="min-w-[100px]"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          @click="isVisible = false"
        />
        <Button
          class="min-w-[100px]"
          :disabled="!isReadAll"
          label="Gửi đăng ký"
          severity="primary"
          @click="handleConfirmRegister"
        />
      </div>
    </div>
  </AppModal>
</template>
