<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { DateTime } from 'luxon'
import { useGetDetailGuestCar } from '../composables/queries/carList/useGetDetailGuestCar'
import { CAR_STATUS } from '../constants/carStatus'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()

const { data: guestCarInfo, isLoading: isGettingGuestCar } = useGetDetailGuestCar(() => id)
</script>
<template>
  <div v-if="isGettingGuestCar" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-2 gap-4">
    <AppTextInput
      label="Khách/Đoàn khách"
      disabled
      :model-value="guestCarInfo?.ownerName"
      name="ownerName"
    />
    <AppTextInput
      label="Đơn vị công tác"
      disabled
      :model-value="guestCarInfo?.guestUnitName"
      name="licensePlate"
    />
    <AppTextInput
      label="Biển số xe"
      disabled
      :model-value="guestCarInfo?.licensePlate"
      name="licensePlate"
    />
    <AppTextInput
      label="Đơn vị đến làm việc tại BKHN"
      disabled
      :model-value="guestCarInfo?.visitUnitName"
      name="visitUnitName"
    />
    <AppTextInput
      label="Ngày đến làm việc"
      disabled
      :model-value="`${guestCarInfo?.startDate ? DateTime.fromISO(guestCarInfo?.startDate).toFormat('dd/MM/yyyy') : '--'} - ${guestCarInfo?.endDate ? DateTime.fromISO(guestCarInfo?.endDate).toFormat('dd/MM/yyyy') : '--'}`"
      name="wordPeriod"
    />
    <AppTextInput
      label="Người tạo đơn"
      disabled
      :model-value="guestCarInfo?.creatorName"
      name="creatorName"
    />
    <AppTextarea
      disabled
      name="workContent"
      label="Nội dung làm việc"
      :model-value="guestCarInfo?.workContent"
    />
    <AppTextarea disabled name="note" label="Ghi chú" :model-value="guestCarInfo?.note" />
    <AppTextarea
      v-if="guestCarInfo?.status === CAR_STATUS.rejected"
      class="col-span-2"
      name="rejectReason"
      label="Lý do từ chối"
      disabled
      :model-value="guestCarInfo?.rejectionReason"
    />
  </div>
</template>
