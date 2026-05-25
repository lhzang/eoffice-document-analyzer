<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'

import { SIGN_PROVIDER_VALUES } from '@/shared/constants/sign'
import type { SigningConfigVM } from '@/shared/services/api'
import { toastError } from '@/shared/utils/common'
import { ref } from 'vue'
import AppModal from './AppModal.vue'

type TDisplayConfig = {
  message: string
  title: string
}

const isVisible = ref(false)

const providerInfo = ref<SigningConfigVM>()
const customDisplayConfig = ref<TDisplayConfig>()

const displayConfig: ComputedRef<TDisplayConfig> = computed(() => {
  if (customDisplayConfig.value)
    return {
      message: customDisplayConfig.value?.message,
      title: customDisplayConfig.value?.title
    }
  if (providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES?.bsign) {
    if (providerInfo.value?.devices?.length)
      return {
        title: 'Đang thực hiện ký số dùng chữ ký số nội bộ',
        message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới ứng dụng di động.'
      }
    else
      return {
        title: 'Đang thực hiện ký số dùng chữ ký số nội bộ',
        message: 'Thầy/Cô chờ trong giây lát...'
      }
  }
  if (
    providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES.mobiSim ||
    providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES.viettelSim
  ) {
    return {
      title: 'Đang thực hiện ký số dùng SimCA',
      message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới thiết bị di động'
    }
  }
  if (
    providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES.vnpt ||
    providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES.viettelRemote
  ) {
    return {
      title: 'Đang thực hiện ký số dùng SimCA',
      message: 'Thầy/Cô chờ trong giây lát để hệ thống gửi yêu cầu ký tới thiết bị di động'
    }
  }
  if (providerInfo?.value?.signingProvider === SIGN_PROVIDER_VALUES.hmuh) {
    return {
      title: '',
      message: 'Đang xác thực...'
    }
  }
  return {
    title: 'Đang ký số, vui lòng đợi',
    message: 'Vui lòng đợi...'
  }
})

const handleReset = () => {
  providerInfo.value = undefined
  customDisplayConfig.value = undefined
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) handleReset()
}

defineExpose({
  openModal: (selectedProvider: SigningConfigVM, displayConfig?: TDisplayConfig) => {
    console.log(selectedProvider, 'selectedProvider')
    if (
      !selectedProvider?.isValid &&
      selectedProvider?.signingProvider !== SIGN_PROVIDER_VALUES?.usb
    )
      return toastError({
        detail: 'Chứng thư số đã hết hạn. Vui lòng gia hạn chứng thư số'
      })
    providerInfo.value = selectedProvider
    customDisplayConfig.value = displayConfig
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :wrapper-style="{ minWidth: '500px' }"
    :closeWhenClickOutside="false"
  >
    <template #header>
      <div class="bg-primary-100 relative flex h-10 w-10 items-center justify-center rounded-full">
        <div class="bg-primary-100 absolute inset-0 scale-[1.5] rounded-full opacity-50"></div>
        <span class="icon-[tdesign--device] text-primary"></span>
      </div>
    </template>
    <div class="flex flex-col justify-center">
      <h4 v-if="displayConfig?.title" class="text-primary text-xl font-semibold">
        {{ displayConfig?.title }}
      </h4>
      <p class="mt-1 font-medium">{{ displayConfig?.message }}</p>
    </div>
    <div class="mt-4 flex items-center justify-center">
      <span class="icon-[line-md--loading-loop] text-primary text-4xl"></span>
    </div>
  </AppModal>
</template>
