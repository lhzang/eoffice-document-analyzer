<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import ModalWaitAcceptSign from '@/shared/components/modals/ModalWaitAcceptSign.vue'
import { ROUTE_PATHS } from '@/shared/constants/router'
import type { TSignProvider } from '@/shared/constants/sign'
import { useSignInDoc } from '../composables/queries/useSignInDoc'

type TModalWaitAcceptSign = InstanceType<typeof ModalWaitAcceptSign>

const router = useRouter()

const props = defineProps<{
  docId: string
  provider: TSignProvider
}>()

const modalWaitAcceptSignRef = useTemplateRef<TModalWaitAcceptSign | null>('modalWaitAcceptSignRef')

const { mutate: signInDocMutation, isPending, isSuccess } = useSignInDoc()

const getTypeSign = computed(() => {
  switch (props.provider) {
    case 'BSIGN':
      return {
        title: 'Đang thực hiện ký số dùng chữ ký số nội bộ',
        message: 'Thầy/Cô chờ trong giây lát...',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
    case 'VNPT':
      return {
        title: 'Đang thực hiện ký số từ xa',
        message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới ứng dụng di động',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
    case 'VIETTELSIM':
      return {
        title: 'Đang thực hiện ký số dùng SimCA',
        message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới ứng dụng di động',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
    case 'VIETTELREMOTE':
      return {
        title: 'Đang thực hiện ký số từ xa',
        message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới ứng dụng di động',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
    case 'MOBISIM':
      return {
        title: 'Đang thực hiện ký số dùng SimCA',
        message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới ứng dụng di động',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
    case 'HMUH':
      return {
        // title: 'Đang thực hiện ký số từ xa',
        message: 'Đang xác thực...',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }

    ///USB Token
    default:
      return {
        title: 'Đang thực hiện ký số dùng USB Token',
        message: 'Thầy/Cô vui lòng kết nối thiết bị của mình',
        icon: 'icon-[mingcute--usb-flash-disk-line] text-2xl'
      }
  }
})

// defineExpose({
//   openModal: () => modalWaitAcceptSignRef.value?.openModal(),
//   closeModal: () => modalWaitAcceptSignRef.value?.closeModal()
// })

watch(
  [() => props.docId, () => props.provider],
  async ([newDocId]) => {
    await nextTick()
    modalWaitAcceptSignRef.value?.openModal()
    signInDocMutation({ docId: newDocId, body: { totp: '999999' } })
  },
  { immediate: true }
)
watch(isPending, (newVal) => {
  if (!newVal) {
    setTimeout(() => modalWaitAcceptSignRef.value?.closeModal(), 100)
  }
})
watch(isSuccess, () => {
  if (isSuccess.value) router.push(ROUTE_PATHS.incomingDoc.inDocCreated)
})

watchEffect(() => {
  console.log('first_render-isPending: ', isPending.value)
})
</script>

<template>
  <ModalWaitAcceptSign
    ref="modalWaitAcceptSignRef"
    :is-loading="isPending"
    :type-sign="getTypeSign"
  />
</template>

<style scoped></style>
