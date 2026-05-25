<script setup lang="ts">
import AppFileInputWithPreview from '@/shared/components/form-elements/AppFileInputWithPreview.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { getFileName } from '@/shared/utils/common'
import { DateTime } from 'luxon'
import { useGetDetailCollaboratorCar } from '../composables/queries/carList/useGetDetailCollaboratorCar'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()

const { data: collaboratorCarInfo, isLoading: isGettingCollaboratorCar } =
  useGetDetailCollaboratorCar(() => id)
</script>
<template>
  <div v-if="isGettingCollaboratorCar" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-2 gap-4">
    <AppTextInput
      label="Họ tên chủ xe"
      disabled
      :model-value="collaboratorCarInfo?.ownerName"
      name="ownerName"
    />
    <AppTextInput
      label="Biển số xe"
      disabled
      :model-value="collaboratorCarInfo?.licensePlate"
      name="licensePlate"
    />
    <AppTextInput
      label="Người đăng ký"
      disabled
      :model-value="collaboratorCarInfo?.registrantName"
      name="registrantName"
    />

    <AppTextInput
      label="Đơn vị"
      disabled
      :model-value="collaboratorCarInfo?.unitName"
      name="unitName"
    />
    <AppTextInput
      label="Số điện thoại"
      disabled
      :model-value="collaboratorCarInfo?.phoneNumber"
      name="phoneNumber"
    />
    <AppTextInput
      label="Ngày đến làm việc"
      disabled
      :model-value="`${collaboratorCarInfo?.startDate ? DateTime.fromISO(collaboratorCarInfo?.startDate).toFormat('dd/MM/yyyy') : '--'} - ${collaboratorCarInfo?.endDate ? DateTime.fromISO(collaboratorCarInfo?.endDate).toFormat('dd/MM/yyyy') : '--'}`"
      name="wordPeriod"
    />
    <AppTextInput
      label="Số eTag (VETC, ePass)"
      disabled
      :model-value="collaboratorCarInfo?.eTag"
      name="eTag"
    />
    <AppFileInputWithPreview
      label="Mặt sau giấy đăng ký xe"
      :file-name="getFileName(collaboratorCarInfo?.registrationFile ?? '') ?? '--'"
      :file-url="collaboratorCarInfo?.registrationFile ?? ''"
      disabled
    />
  </div>
</template>
