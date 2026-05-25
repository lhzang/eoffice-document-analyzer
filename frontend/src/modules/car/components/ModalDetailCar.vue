<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { ref } from 'vue'
import type { TCarType } from '../models/common'
import DetailCollaboratorCar from './DetailCollaboratorCar.vue'
import DetailGuestCar from './DetailGuestCar.vue'
import DetailStaffCar from './DetailStaffCar.vue'
import DetailStudentCar from './DetailStudentCar.vue'
import DetailUniCar from './DetailUniCar.vue'

// type TProps = {
//   id: string
//   type: TCarType
// }

// const { id, type } = defineProps<TProps>()

const isVisible = ref<boolean>(false)
const carInfo = ref<{ id: string; type: TCarType } | null>(null)

const emit = defineEmits<{
  (e: 'updateEtagSuccess'): void
}>()

defineExpose({
  openModal: (id: string, type: TCarType) => {
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
    <DetailStaffCar
      v-if="carInfo?.type === 'STAFF'"
      :id="carInfo?.id"
      @update-etag-success="emit('updateEtagSuccess')"
    />
    <DetailUniCar v-if="carInfo?.type === 'UNIVERSITY'" :id="carInfo?.id" />
    <DetailGuestCar v-if="carInfo?.type === 'GUEST'" :id="carInfo?.id" />
    <DetailCollaboratorCar v-if="carInfo?.type === 'COLLABORATOR'" :id="carInfo?.id" />
    <DetailStudentCar v-if="carInfo?.type === 'STUDENT'" :id="carInfo?.id" />
  </AppModal>
</template>
