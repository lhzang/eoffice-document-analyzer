<script setup lang="ts">
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { useGetDetailUniCar } from '../composables/queries/carList/useGetDetailUniversityCar'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()

const { data: uniCarInfo, isLoading: isGettingUniCar } = useGetDetailUniCar(() => id)
</script>
<template>
  <div v-if="isGettingUniCar" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-2 gap-4">
    <AppTextInput
      label="Biển số xe"
      disabled
      :model-value="uniCarInfo?.licensePlate"
      name="licensePlate"
    />
    <AppTextInput
      label="Số eTag(VETC, ePass)"
      disabled
      :model-value="uniCarInfo?.eTag"
      name="eTag"
    />
  </div>
</template>
