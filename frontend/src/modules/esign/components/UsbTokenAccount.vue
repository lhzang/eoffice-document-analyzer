<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import { useGetEsignAccount } from '@/modules/esign/composables/esign-account/useGetEsignAccount'
import { useToggleUsbAccount } from '@/modules/esign/composables/esign-account/useToggleUsbAccount'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { useQueryClient } from '@tanstack/vue-query'
import { ToggleSwitch, useToast } from 'primevue'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef, watch } from 'vue'
import type { ToggleUsbAccountRequest } from '../model/esignAccount'

const props = defineProps<{
  accountId?: string
}>()

const usbTokenState = ref({
  current: false,
  pending: null as boolean | null
})

const { data, isLoading, refetch } = useGetEsignAccount(props.accountId)
watch(
  () => data.value?.accounts?.usb,
  (usb) => {
    if (typeof usb === 'boolean') {
      usbTokenState.value.current = usb
    }
  },
  { immediate: true }
)

type ModalRef = InstanceType<typeof AppModal>
const modalRef = useTemplateRef<ModalRef | null>('modalRef')
const queryClient = useQueryClient()
const toast = useToast()

const account = ref<{ accountId: string; usbToken: boolean } | null>(null)
const { handleSubmit, resetForm } = useForm({ initialValues: { message: '' } })

function resetState() {
  usbTokenState.value.pending = null
  account.value = null
  resetForm()
}

const { mutate: toggleUsbAccount, isPending } = useToggleUsbAccount({
  onSuccess: async () => {
    queryClient.invalidateQueries({ queryKey: ['getEsignAccounts'] })
    await refetch()
    resetState()
    modalRef.value?.closeModal()
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Thay đổi trạng thái thành công'
    })
  }
})

function onToggle() {
  if (!props.accountId) return
  usbTokenState.value.pending = !usbTokenState.value.current
  account.value = {
    accountId: props.accountId,
    usbToken: usbTokenState.value.pending
  }
  modalRef.value?.openModal()
}

const onSubmit = handleSubmit(() => {
  if (!account.value) return

  const req: ToggleUsbAccountRequest = {
    accountId: account.value.accountId,
    usbToken: account.value.usbToken,
    message: account.value.usbToken ? 'Bật USB Token' : 'Tắt USB Token'
  }
  toggleUsbAccount(req)
})

function handleModalClose() {
  resetState()
  modalRef.value?.closeModal()
}
</script>

<template>
  <div v-if="isLoading" class="mt-10 flex h-[400px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"></span>
  </div>
  <div v-else>
    <div class="card mt-4">
      <h3 class="text-lg font-semibold">Ký số sử dụng USB Token</h3>
      <div class="text-gray-500">
        Thầy/Cô đọc hướng dẫn cài đặt ký số USB Token
        <a
          class="text-red-500"
          target="_blank"
          href="https://drive.google.com/drive/u/2/folders/1iQLnrNNhWBnlGWfPdUi3ReVA_nsL-tAo"
          >tại đây</a
        >
      </div>
    </div>

    <div class="card mt-4 flex flex-wrap items-center gap-4">
      <h3 class="text-lg font-semibold">Thầy/Cô có sử dụng USB Token không?</h3>
      <ToggleSwitch
        :model-value="usbTokenState.pending ?? usbTokenState.current"
        @change.prevent="onToggle"
      />
    </div>

    <AppModal
      :wrapper-style="{ width: '90%', maxWidth: '500px', margin: '0 3rem' }"
      ref="modalRef"
      title="Xác nhận thay đổi trạng thái USB Token"
      @hide="handleModalClose"
    >
      <form @submit="onSubmit" class="flex flex-wrap">
        <div v-if="account?.usbToken">
          {{
            `Thầy/Cô xác nhận đã có USB Token và đã cài Plugin ${appConfig.VITE_ESIGN_PROVIDER_LABEL}?`
          }}
        </div>
        <div v-else>Thầy/Cô xác nhận không sử dụng ký số USB Token?</div>
        <slot name="footer">
          <div class="mt-4 flex w-full justify-end gap-4">
            <Button label="Hủy" type="button" @click="handleModalClose" :disabled="isPending" />
            <Button label="Xác nhận" type="submit" :loading="isPending" />
          </div>
        </slot>
      </form>
    </AppModal>
  </div>
</template>
