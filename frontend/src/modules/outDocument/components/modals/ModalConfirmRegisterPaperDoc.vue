<script setup lang="ts">
import { RECEIVER_SYSTEM_TYPES } from '@/shared/constants/document'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { ConfirmDialog, useConfirm } from 'primevue'
import { computed } from 'vue'
const confirm = useConfirm()
const profileStore = useUserProfileStore()
const currentUserPosition = computed(() => profileStore.user?.currentPosition)

type TProps = {
  destinations?: TFormSelectDestinationValue[]
}

const { destinations } = defineProps<TProps>()

defineExpose({
  show: (callback: () => void) => {
    confirm.require({
      header: 'Chú ý',
      group: 'confirmRegister',
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
    group="confirmRegister"
    class="w-[600px]"
    :pt="{
      header: {
        class: 'text-primary'
      }
    }"
  >
    <template #message>
      <div class="text-primary">
        <div class="font-bold">
          Thầy/Cô đang đăng ký phát hành văn bản đi ký giấy
          {{
            currentUserPosition
              ? `ở vị trí
            ${currentUserPosition?.title} - ${currentUserPosition?.unitShortName}`
              : ''
          }}
        </div>
        <div
          class="font-bold"
          v-if="
            destinations?.some(
              (destination) =>
                destination?.systemType === RECEIVER_SYSTEM_TYPES.external &&
                !destination?.axisOrgId
            )
          "
        >
          Nơi nhận bao gồm đơn vị bên ngoài chưa có mã định danh. Thầy/Cô có chắc chắn muốn tiếp
          tục?
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
