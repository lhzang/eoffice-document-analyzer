<script setup lang="ts">
import AppFileInputWithPreview from '@/shared/components/form-elements/AppFileInputWithPreview.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { getFileName } from '@/shared/utils/common'
import { DateTime } from 'luxon'
import { watchEffect } from 'vue'
import { useGetDetailStudentCar } from '../composables/queries/carList/useGetDetailStudentCar'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()

const { data: studentCarInfo, isLoading: isGettingStudentCar } = useGetDetailStudentCar(() => id)
watchEffect(() => {
  console.log(studentCarInfo, 'sdffdsdsffdsdfs')
})
</script>
<template>
  <div v-if="isGettingStudentCar" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-2 gap-4">
    <AppTextInput
      label="Họ tên người học"
      disabled
      :model-value="studentCarInfo?.studentName"
      name="studentName"
    />
    <AppTextInput
      label="Mã số người học (Mã số NCS/học viên/sinh viên)"
      disabled
      :model-value="studentCarInfo?.studentCode"
      name="studentCode"
    />

    <AppTextInput
      label="Khoá"
      disabled
      :model-value="studentCarInfo?.intakeCode"
      name="intakeCode"
    />
    <AppTextInput label="Lớp" disabled :model-value="studentCarInfo?.className" name="className" />
    <AppTextInput
      label="Năm nhập học"
      disabled
      :model-value="studentCarInfo?.admissionYear"
      name="admissionYear"
    />
    <AppTextInput
      label="Thời điểm tốt nghiệp"
      disabled
      :model-value="
        studentCarInfo?.graduationDate
          ? DateTime.fromISO(studentCarInfo?.graduationDate).toFormat('yyyy')
          : ''
      "
      name="licensePlate"
    />
    <AppTextInput
      label="Số eTag (VETC, ePass)"
      disabled
      :model-value="studentCarInfo?.eTag"
      name="eTag"
    />
    <AppTextInput label="Email" disabled :model-value="studentCarInfo?.email" name="email" />
    <AppTextInput
      label="Tên chủ xe"
      disabled
      :model-value="studentCarInfo?.ownerName"
      name="ownerName"
    />
    <AppTextInput
      label="Biển số xe"
      disabled
      :model-value="studentCarInfo?.licensePlate"
      name="licensePlate"
    />
    <AppFileInputWithPreview
      class="col-span-2"
      label="Mặt sau giấy đăng ký xe"
      :file-name="
        studentCarInfo?.registrationFile
          ? getFileName(studentCarInfo?.registrationFile ?? '')!
          : (studentCarInfo?.registrationLink ?? '--')
      "
      :file-url="studentCarInfo?.registrationLink ?? studentCarInfo?.registrationFile ?? ''"
      disabled
    />
  </div>
</template>
