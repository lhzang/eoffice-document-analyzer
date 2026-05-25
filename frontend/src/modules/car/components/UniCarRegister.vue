<script setup lang="ts">
import TemplateExcel from '@/assets/files/template_university.xlsx'
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
        download="template_university"
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
        placeholder="Biển số xe"
        :hint-content="'VD: 30A-123.45'"
        required
        label="Biển số xe"
        name="licensePlate"
      />
      <AppTextInput
        placeholder="Nhập số thẻ eTag/ePass"
        required
        label="Số eTag(VETC, ePass)"
        name="eTag"
      />
    </div>
  </div>
</template>
