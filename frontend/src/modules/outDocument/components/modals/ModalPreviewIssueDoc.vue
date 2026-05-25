<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { RECEIVER_SYSTEM_TYPES } from '@/shared/constants/document'
import {
  SIGN_PROVIDER_LABEL,
  SIGN_PROVIDER_VALUES,
  type TSignProvider
} from '@/shared/constants/sign'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import type { TSignProviderValue } from '@/shared/models/sign'
import { Button } from 'primevue'
import { computed, ref } from 'vue'
import { usePreviewIssueDoc } from '../../composables/queries/usePreviewIssueDoc'
const isVisible = ref(false)

type TProps = {
  fileName: string
  destinations: TFormSelectDestinationValue[]
  documentId: string
  outOrdinal: string
  documentCode: string
  issueDate: string
}

const { destinations, fileName, documentId, outOrdinal, documentCode, issueDate } =
  defineProps<TProps>()

const previewFile = ref<File | null>(null)
const provider = ref<TSignProvider>()

const internalDes = computed(() =>
  destinations?.filter((destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES?.internal)
)
const externalDes = computed(() =>
  destinations?.filter((destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES?.external)
)

const {
  mutate: previewDoc,
  isPending: isGettingPreviewDoc,
  error
} = usePreviewIssueDoc({
  onSuccess: (file) => {
    previewFile.value = file
  }
})

const emit = defineEmits<{
  (e: 'confirmRegister'): void
}>()

const reset = () => {
  previewFile.value = null
  provider.value = undefined
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
  openModal: (selectedProvider: TSignProviderValue) => {
    provider.value = selectedProvider
    isVisible.value = true
    previewDoc({
      body: {
        documentId,
        outOrdinal: outOrdinal,
        issuedDate: issueDate
      },
      fileName
    })
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
    hideCloseButton
  >
    <template #header>
      <div class="mr-4 grid w-full grid-cols-3 gap-6">
        <div class="text-primary col-span-3 flex flex-col text-lg font-semibold lg:col-span-2">
          <div v-if="provider === SIGN_PROVIDER_VALUES?.bsign">
            {{
              `Lưu ý: Thầy/Cô đang chọn chữ ký số nội bộ ${SIGN_PROVIDER_LABEL?.BSIGN} để đóng dấu văn bản đi!`
            }}
          </div>
          <div>*Không thể bổ sung Đơn vị bên ngoài sau khi phát hành văn bản đi</div>
          <div v-if="!destinations?.length">*Văn bản chưa có nơi nhận</div>
        </div>
        <div class="col-span-3 text-right text-lg font-semibold lg:col-span-1">
          Số và ký hiệu văn bản:
          <span class="text-red-500">{{ outOrdinal }}/{{ documentCode }}</span>
        </div>
      </div>
    </template>
    <div class="flex h-full flex-col">
      <div v-if="isGettingPreviewDoc" class="relative flex h-full items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div v-else-if="error" class="border-shadow relative flex h-full items-center justify-center">
        {{ error?.response?.data?.detail ?? error?.message ?? 'Có lỗi khi xem trước văn bản' }}
      </div>
      <div class="flex h-full w-full gap-4 overflow-auto" v-else-if="previewFile">
        <div class="border-shadow h-full flex-1 overflow-auto">
          <PdfViewer class="flex-1" :src="previewFile" :initial-scale="'PageFit'" />
        </div>
        <div
          class="border-shadow flex max-h-full min-h-40 w-[300px] flex-col gap-6 overflow-auto p-4 font-semibold"
          v-if="externalDes?.length || internalDes?.length"
        >
          <span class="text-primary -mb-4 text-lg">Nơi nhận:</span>
          <div v-if="externalDes?.length">
            <div class="text-md mb-1 flex items-center gap-2">
              <div class="bg-primary h-4 w-4 rounded-full"></div>
              <span class="text-primary">Ngoài tổ chức</span>
            </div>
            <div class="ml-6 flex flex-col items-start">
              <div v-for="(destination, idx) in externalDes" :key="idx">
                {{ destination?.name }}
              </div>
            </div>
          </div>
          <div v-if="internalDes?.length">
            <div class="text-md mb-1 flex items-center gap-2">
              <div class="bg-primary h-4 w-4 rounded-full"></div>
              <span class="text-primary">Trong tổ chức</span>
            </div>
            <div class="ml-6 flex flex-col items-start">
              <div v-for="(destination, idx) in internalDes" :key="idx">
                {{ destination?.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5 flex items-center justify-end gap-2">
        <Button
          class="min-w-25"
          label="Huỷ"
          severity="secondary"
          variant="outlined"
          @click="isVisible = false"
        />
        <Button
          class="min-w-25"
          label="Xác nhận"
          severity="primary"
          @click="handleConfirmRegister"
        />
      </div>
    </div>
  </AppModal>
</template>
