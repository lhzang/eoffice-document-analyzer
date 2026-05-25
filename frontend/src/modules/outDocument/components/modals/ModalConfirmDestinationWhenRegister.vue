<script setup lang="ts">
import { checkMatchEnv } from '@/shared/utils/common'
import { ConfirmDialog, useConfirm } from 'primevue'
const confirm = useConfirm()

defineExpose({
  show: (callback: () => void) => {
    confirm.require({
      header: 'Chú ý',

      group: 'confirmRegisterWithNoAxiosId',
      rejectProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Gửi đăng ký',
        severity: 'danger'
      },
      accept: () => {
        callback()
      }
    })
  }
})
</script>
<template>
  <ConfirmDialog
    group="confirmRegisterWithNoAxiosId"
    class="w-[600px]"
    :pt="{
      header: {
        class: 'text-primary'
      }
    }"
  >
    <template #message>
      <div>
        <div
          v-if="checkMatchEnv(['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'])"
          class="font-bold"
        >
          Hiện tại Trường chưa có kết nối liên thông với trục văn bản quốc gia.
        </div>
        <div v-else class="font-bold">Nơi nhận bao gồm đơn vị bên ngoài chưa có mã định danh.</div>
        <div class="font-bold">
          Do vậy, văn bản sau khi phát hành cần được in ra, gửi tới đơn vị nhận.
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
