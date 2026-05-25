<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { Button, Divider, Image, Tag, useConfirm } from 'primevue'
import { computed, ref } from 'vue'
import { useSignatureImages } from '../composables/esign-image/useGetSignatureImage'
import { useProcessApproveRequest } from '../composables/signature-approve/useProcessApproveRequest'
import { SIGNATURE_IMG_STATES, SIGNATURE_IMG_TYPES } from '../constants/signatureImage'
import type { TSignatureImageState, TSignatureImageType } from '../model/signatureimg'
import { getLabelByState, getSeverityByState } from '../utils/signatureImage'

type TSignatureData = {
  label: string
  state: TSignatureImageState | null
  type: TSignatureImageType
  url?: string
}
type TRejectModalType = InstanceType<typeof AppModalWithMessage>

const emit = defineEmits<{
  (e: 'actionProcessed'): void
}>()

const rejectModalRef = ref<TRejectModalType | null>(null)

const accountId = ref<string | null>(null)

const {
  data: signatureImages,
  isLoading: isGetttingImages,
  isSuccess: isGetImagesSucess,
  refetch
} = useSignatureImages(() => accountId.value!, {
  enabled: () => !!accountId.value
})

const listSignatureData = computed(() => {
  const signatureImagesValue = signatureImages.value
  return [
    {
      label: 'Chữ ký chính',
      state: signatureImagesValue?.major?.state as TSignatureImageState,
      type: SIGNATURE_IMG_TYPES.major,
      url: signatureImagesValue?.major?.url
    },
    {
      label: 'Chữ ký nháy',
      state: signatureImagesValue?.minor?.state as TSignatureImageState,
      type: SIGNATURE_IMG_TYPES.minor,
      url: signatureImagesValue?.minor?.url
    },
    {
      label: 'Chữ ký chính (Văn phòng Đại học lưu)',
      state: null,
      type: SIGNATURE_IMG_TYPES.originalMajor,
      url: signatureImagesValue?.originalMajor?.url
    },
    {
      label: 'Chữ ký nháy (Văn phòng Đại học lưu)',
      state: null,
      type: SIGNATURE_IMG_TYPES.originalMinor,
      url: signatureImagesValue?.originalMinor?.url
    }
  ] as TSignatureData[]
})

const isVisible = ref<boolean>(false)

const { mutate: processRequest, isPending: isProcessing } = useProcessApproveRequest({
  onSuccess: () => {
    emit('actionProcessed')
    refetch()
    rejectModalRef?.value?.closeModal()
  }
})

const confirm = useConfirm()

const handleWhenModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    accountId.value = null
  }
}

const showConfirmApprove = (signature: TSignatureData) => {
  confirm.require({
    message: `Thầy/Cô có xác nhận đồng ý duyệt chữ ký?`,
    // group: 'confirm',
    header: 'Duyệt chữ ký',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!accountId.value) return
      processRequest(
        {
          signatureType: signature?.type as Extract<TSignatureImageType, 'major' | 'minor'>,
          accountId: accountId?.value,
          reviewResult: 'accept'
        },
        {
          onSuccess: () => {
            toastSucceed({
              detail: `Duyệt chữ ký ${signature?.type === SIGNATURE_IMG_TYPES.major ? 'chính' : 'nháy'} thành công`
            })
          }
        }
      )
    }
  })
}

const handleConfirmReject = (signature: TSignatureData, message?: string) => {
  if (!accountId?.value) return
  processRequest(
    cleanObject({
      signatureType: signature?.type as Extract<TSignatureImageType, 'major' | 'minor'>,
      accountId: accountId?.value,
      reviewResult: 'reject',
      rejectReason: message?.trim() || undefined
    }),
    {
      onSuccess: () => {
        toastSucceed({
          detail: `Từ chối duyệt chữ ký ${signature?.type === SIGNATURE_IMG_TYPES.major ? 'chính' : 'nháy'} thành công`
        })
      }
    }
  )
}

defineExpose({
  openModal: (id: string) => {
    accountId.value = id
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Duyệt ảnh chữ ký"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :wrapper-style="{ width: '60%' }"
  >
    <div class="grid grid-cols-2 gap-6">
      <div
        v-for="(signature, idx) in listSignatureData"
        :key="idx"
        class="border-primary min-h-[150px] rounded-xl border p-4"
      >
        <div class="flex items-center justify-between">
          <span class="text-primary text-xl font-semibold">{{ signature.label }}</span>
          <div
            v-if="signature?.type === 'major' || signature.type === 'minor'"
            class="flex items-center gap-2"
          >
            <Button
              v-if="signature.state !== SIGNATURE_IMG_STATES.accepted && signature?.url"
              variant="outlined"
              severity="success"
              @click="showConfirmApprove(signature)"
              :loading="isProcessing"
              :disabled="isGetttingImages"
              class="flex items-center justify-center rounded-sm border-2! p-2"
            >
              <span class="icon-[charm--tick]"></span>
            </Button>
            <Button
              v-if="signature.state !== SIGNATURE_IMG_STATES.rejected && signature?.url"
              variant="outlined"
              severity="danger"
              @click="rejectModalRef?.openModal(signature)"
              :loading="isProcessing"
              :disabled="isGetttingImages"
              class="flex items-center justify-center rounded-sm border-2! p-2"
            >
              <span class="icon-[uil--multiply]"></span>
            </Button>
          </div>
        </div>
        <Divider></Divider>
        <div class="relative" :class="`${signature.url ? 'h-[200px]' : 'h-[100px]'} `">
          <template v-if="signature?.url">
            <Image :src="signature.url" image-class="max-w-full max-h-full align-middle" />
            <Tag
              rounded
              v-if="signature?.state"
              :severity="getSeverityByState(signature.state)"
              :value="getLabelByState(signature.state)"
              class="absolute top-[2px] right-[2px]"
            />
          </template>
          <span v-else>Chưa có</span>
        </div>
      </div>
    </div>
  </AppModal>
  <AppModalWithMessage
    ref="rejectModalRef"
    title="Từ chối"
    :isMessageRequired="false"
    @submit="
      ({ message }, customData) => handleConfirmReject(customData as TSignatureData, message)
    "
    labelMessageInput="Lý do từ chối"
  />
</template>
