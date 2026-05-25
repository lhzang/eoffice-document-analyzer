<script setup lang="ts">
import { useDeleteDevice } from '@/modules/esign/composables/device-signed/useDeleteDevice'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { useCountdown } from '@vueuse/core'
import { Button, useToast } from 'primevue'
import { ref, watch } from 'vue'
import KeyValueElement from '../components/KeyValueElement.vue'
import { useGetDevice } from '../composables/device-signed/useGetDevice'
import { useSendEmailTotp } from '../composables/device-signed/useGetEmailTotp'

import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import 'primeicons/primeicons.css'
import InputOtp from 'primevue/inputotp'

const user = useUserProfileStore().user
const email = user?.username
const accountId = user?.username

const { mutate: deleteMutation, isPending } = useDeleteDevice()
const { data, refetch, isLoading } = useGetDevice(email)
const { mutate: sendtotp } = useSendEmailTotp()

const totp = ref('')
const showConfirm = ref(false)
const toast = useToast()
const selectedDeviceId = ref<string | null>(null)

const { remaining, start, reset } = useCountdown(180, {
  onComplete() {
    showConfirm.value = false
  }
})

watch(showConfirm, (isOpen) => {
  if (isOpen) {
    totp.value = ''
    reset()
    start()
  }
})

function onClickDelete(deviceId: string) {
  if (!email) return
  selectedDeviceId.value = deviceId
  sendtotp(email, {
    onSuccess: () => {
      showConfirm.value = true
    }
  })
  console.log('3')
}

function deleteAccount(deviceId: string, accountId: string, totp: string) {
  console.log(deviceId, accountId, totp)
  deleteMutation(
    { deviceId, accountId, totp },
    {
      onSuccess: () => {
        showConfirm.value = false
        refetch()
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Xóa thiết bị thành công',
          life: APP_NOTI_TIME
        })
      }
    }
  )
}

const handleCancelDelete = () => {
  showConfirm.value = false
  totp.value = ''
}

const handleDelteAccount = () => {
  if (!accountId || !selectedDeviceId?.value || !totp?.value) return
  deleteAccount(selectedDeviceId.value!, accountId, totp.value)
}
</script>

<template>
  <div>
    <div class="mb-4 text-2xl font-semibold">Danh sách thiết bị đã xác thực</div>
    <div v-if="isLoading" class="mt-10 flex h-[400px] items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-4xl"></span>
    </div>
    <div v-else-if="data && data.length > 0">
      <div v-for="device in data" :key="device.id" class="card mb-5 p-8">
        <div class="flex items-center justify-between">
          <div class="text-xl font-semibold">ID thiết bị: {{ device.id }}</div>
          <Button
            :disabled="isPending"
            v-if="device.id"
            @click="onClickDelete(device.id)"
            class="font-semibold"
          >
            <i class="pi pi-trash"></i>
            <span class="hidden sm:inline">Xóa</span>
          </Button>
        </div>
        <KeyValueElement label="Nền tảng (Platform)" :value="device.deviceInfo.platform" />
        <KeyValueElement label="Mẫu thiết bị (Model)" :value="device.deviceInfo.model" />
        <KeyValueElement label="Tên thiết bị (Name)" :value="device.deviceInfo.name" />
        <KeyValueElement label="Mã thiết bị (Device ID)" :value="device.deviceInfo.id" />
        <KeyValueElement label="Phiên bản (Version)" :value="device.deviceInfo.version" />
      </div>
      <div>
        <AppModal
          :wrapper-style="{ width: '100%', maxWidth: '900px', margin: '0 3rem' }"
          v-model:visible="showConfirm"
          @close="selectedDeviceId = null"
          title="Xác nhận xóa tài khoản ký số"
        >
          <div>Vui lòng kiểm tra email để nhận mã TOTP. Mã TOTP gồm 6 chữ số</div>
          <div class="my-4 flex items-center justify-center gap-4">
            <InputOtp
              v-model="totp"
              :length="6"
              integerOnly
              id="totp"
              placeholder="Nhập mã xác thực 6 số"
            />

            <div class="whitespace-nowrap">
              {{ remaining }}
            </div>
          </div>
          <slot name="footer">
            <div class="mt-5 flex w-full justify-end gap-4">
              <Button label="Hủy" type="button" @click="handleCancelDelete" :disabled="isPending" />
              <Button label="Xác nhận" @click="handleDelteAccount()" :loading="isPending" />
            </div>
          </slot>
        </AppModal>
      </div>
    </div>
    <div v-else class="mt-4 text-center text-gray-500">
      Tài khoản này chưa đăng ký thiết bị xác thực nào!
    </div>
  </div>
</template>
