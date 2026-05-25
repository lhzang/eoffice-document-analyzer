<script setup lang="ts">
import TemplateExcel from '@/assets/files/template_contributor.xlsx'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { EXCEL_FILE_TYPE } from '@/shared/constants/document'
import { RadioButton } from 'primevue'
import { useField, useFormContext } from 'vee-validate'
import { watch } from 'vue'
import type z from 'zod'
import { CAR_TYPES } from '../constants/carType'
import type { carRegisSchema } from '../schemas/carRegisterSchema'
const { value } = useField<'manual' | 'upload'>('type', undefined, {
  initialValue: 'manual'
})

const { resetField, values } = useFormContext<z.infer<typeof carRegisSchema>>()

watch(value, () => {
  resetField('licensePlate')
  resetField('phoneNumber')
  resetField('registrationFile')
  resetField('workPeriod')
  resetField('eTag')
  resetField('uploadFile')
})
</script>
<template>
  <!-- excel -->

  <div class="col-span-2">
    <div class="flex items-center gap-2">
      <RadioButton v-model="value" inputId="upload" name="type" value="upload" />
      <label for="upload">Tải file excel</label>
    </div>
    <div class="mt-4 flex w-full flex-col gap-4" v-if="value === 'upload'">
      <AppFileInput name="uploadFile" label="File danh sách xe" :accept="EXCEL_FILE_TYPE" />
      <a
        :href="TemplateExcel"
        target="_blank"
        rel="noopener noreferrer"
        download="template_contributor"
      >
        <div class="text-primary transition-all hover:underline">File mẫu</div>
      </a>
    </div>
  </div>

  <!-- manual -->
  <div class="col-span-2">
    <div class="flex items-center gap-2">
      <RadioButton v-model="value" inputId="manual" name="type" value="manual" />
      <label for="manual">Nhập thủ công</label>
    </div>
    <div v-if="value === 'manual'" class="mt-4 grid w-full grid-cols-2 gap-4">
      <AppTextInput placeholder="Nhập họ tên" required label="Họ tên" name="ownerName" />
      <AppTextInput
        placeholder="Biển số xe"
        :hint-content="'VD: 30A-123.45'"
        required
        label="Biển số xe"
        name="licensePlate"
      />
      <AppTextInput
        placeholder="Nhập số điện thoại"
        required
        label="Số điện thoại"
        name="phoneNumber"
      />
      <AppTextInput
        placeholder="Nhập số thẻ eTag/ePass"
        required
        label="Số eTag(VETC, ePass)"
        name="eTag"
      />
      <AppDateInput
        name="workPeriod"
        date-format="dd/mm/yy"
        :max-date="
          values.carTypeValue === CAR_TYPES.collaborator &&
          values?.type === 'manual' &&
          values?.workPeriod?.[0]
            ? new Date(values?.workPeriod?.[0].getTime() + 180 * 1000 * 60 * 60 * 24)
            : undefined
        "
        :min-date="
          values.carTypeValue === CAR_TYPES.collaborator &&
          values?.type === 'manual' &&
          values?.workPeriod?.[0]
            ? values?.workPeriod?.[0].getTime() - 180 * 1000 * 60 * 60 * 24 > new Date().getTime()
              ? new Date(values?.workPeriod?.[0].getTime() - 180 * 1000 * 60 * 60 * 24)
              : new Date()
            : new Date()
        "
        required
        selectionMode="range"
        placeholder="Nhập thời gian làm việc(tối đa 6 tháng)"
        label="Thời gian làm việc"
        hide-on-range-selection
      />
      <AppFileInput
        placeholder="Tải mặt sau lên"
        label="Mặt sau giấy đăng ký xe"
        required
        name="registrationFile"
        accept=".pdf, .png, .jpg, .jpeg, application/pdf, image/png, image/jpeg"
      />
    </div>
  </div>
</template>
