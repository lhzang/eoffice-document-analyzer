<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { ref } from 'vue'
import type { TCarType } from '../models/common'
import DetailRequestGuestCar from './DetailRequestGuestCar.vue'
import DetailRequestStaffCar from './DetailRequestStaffCar.vue'

// type TProps = {
//   id: string
//   type: TCarType
// }

// const { id, type } = defineProps<TProps>()

const isVisible = ref<boolean>(false)
const carInfo = ref<{ id: string; type: Extract<TCarType, 'STAFF' | 'GUEST'> } | null>(null)

const emit = defineEmits<{
  (e: 'processedStaffCar'): void
  (e: 'processedGuestCar'): void
}>()

const handleAfterProcessStaffCar = () => {
  isVisible.value = false
  emit('processedStaffCar')
}
const handleAfterProcessGuestCar = () => {
  isVisible.value = false
  emit('processedGuestCar')
}

defineExpose({
  openModal: (id: string, type: Extract<TCarType, 'STAFF' | 'GUEST'>) => {
    isVisible.value = true
    carInfo.value = { id, type }
  },
  closeModal: () => {
    isVisible.value = false
    carInfo.value = null
  }
})
</script>
<template>
  <AppModal
    title="Thông tin chi tiết xe"
    v-model:visible="isVisible"
    :wrapper-style="{ width: '60%' }"
  >
    <DetailRequestStaffCar
      v-if="carInfo?.type === 'STAFF'"
      :id="carInfo?.id"
      @processed-car="handleAfterProcessStaffCar"
    />
    <DetailRequestGuestCar
      v-if="carInfo?.type === 'GUEST'"
      :id="carInfo?.id"
      @processed-car="handleAfterProcessGuestCar"
    />
  </AppModal>
</template>
