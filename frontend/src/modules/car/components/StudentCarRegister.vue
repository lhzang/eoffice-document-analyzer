<script setup lang="ts">
import TemplateExcel from '@/assets/files/template_student.xlsx'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { EXCEL_FILE_TYPE } from '@/shared/constants/document'
import { RadioButton } from 'primevue'
import { useField, useFormContext } from 'vee-validate'
import { watch } from 'vue'
import type z from 'zod'
import type { carRegisSchema } from '../schemas/carRegisterSchema'
const { value } = useField<'manual' | 'upload'>('type', undefined, {
  initialValue: 'manual'
})

const { resetField } = useFormContext<z.infer<typeof carRegisSchema>>()

watch(value, () => {
  resetField('licensePlate')
  resetField('registrationFile')
  resetField('studentName')
  resetField('studentCode')
  resetField('intakeCode')
  resetField('className')
  resetField('admissionYear')
  resetField('email')
  resetField('ownerName')
  resetField('graduationDate')
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
        download="template_student"
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
      <AppTextInput
        placeholder="Nhập họ tên người học"
        label="Họ tên người học"
        name="studentName"
      />
      <AppTextInput placeholder="Nhập mã số người học" label="Mã số người học" name="studentCode" />
      <AppTextInput placeholder="Nhập khóa học" label="Khóa" name="intakeCode" />
      <AppTextInput placeholder="Nhập lớp học" label="Lớp" name="className" />
      <AppDateInput
        name="admissionYear"
        placeholder="Nhập năm nhập học"
        label="Năm nhập học"
        view="year"
        dateFormat="yy"
      />
      <AppDateInput
        name="graduationDate"
        placeholder="Nhập thời điểm tốt nghiệp"
        label="Thời điểm tốt nghiệp"
        :date-format="'dd/mm/yy'"
        required
        :min-date="new Date()"
      />
      <AppTextInput
        placeholder="Nhập số thẻ eTag/ePass"
        required
        label="Số eTag(VETC, ePass)"
        name="eTag"
      />
      <AppTextInput placeholder="Nhập email" label="Email" name="email" />
      <AppTextInput placeholder="Nhập tên chủ xe" label="Tên chủ xe" name="ownerName" required />
      <AppTextInput
        placeholder="Biển số xe"
        :hint-content="'VD: 30A-123.45'"
        required
        label="Biển số xe"
        name="licensePlate"
      />
      <AppFileInput
        class="col-span-2"
        placeholder="Tải mặt sau lên"
        label="Mặt sau giấy đăng ký xe"
        required
        name="registrationFile"
        accept=".pdf, .png, .jpg, .jpeg, application/pdf, image/png, image/jpeg"
      />
    </div>
  </div>
</template>
