<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import type { unitSchema } from '@/shared/schemas/commonSchema'
import { useField, useFormContext } from 'vee-validate'
import z from 'zod'
import { CAR_TYPES } from '../constants/carType'
import { guestCarSchema } from '../schemas/carRegisterSchema'

const { values, errors } = useFormContext<z.infer<typeof guestCarSchema>>()
const { value: visitUnit, setValue: setVisitUnit } = useField<
  z.infer<typeof unitSchema> | undefined
>('visitUnit')
</script>

<template>
  <AppTextInput
    label="Họ tên khách/đoàn khách tới làm việc"
    required
    name="ownerName"
    placeholder="Nhập họ tên"
  />
  <AppTextInput
    placeholder="Đơn vị công tác"
    label="Nhập tên cơ quan/đơn vị"
    name="guestUnitName"
  />
  <AppTextInput
    placeholder="Nhập một hoặc nhiều biển số xe, ngăn cách bằng dấu “;”"
    :hint-content="'VD: 30H-123.45;'"
    required
    label="Biển số xe"
    name="licensePlate"
  />
  <InternalUnitSelect
    label="Đơn vị đến làm việc tại BKHN"
    required
    :is-select-multiple="false"
    type="FULL"
    :model-value="visitUnit"
    :error-message="errors?.visitUnit"
    @submit="(unit) => setVisitUnit(unit)"
  />
  <AppDateInput
    name="workPeriod"
    :max-date="
      values.carTypeValue === CAR_TYPES.guest && values?.workPeriod?.[0]
        ? new Date(values?.workPeriod?.[0].getTime() + 6 * 1000 * 60 * 60 * 24)
        : undefined
    "
    :min-date="
      values.carTypeValue === CAR_TYPES.guest && values?.workPeriod?.[0]
        ? values?.workPeriod?.[0].getTime() - 6 * 1000 * 60 * 60 * 24 > new Date().getTime()
          ? new Date(values?.workPeriod?.[0].getTime() - 6 * 1000 * 60 * 60 * 24)
          : new Date()
        : new Date()
    "
    required
    selectionMode="range"
    placeholder="Nhập thời gian làm việc"
    label="Ngày đến làm việc (1-7 ngày)"
    :date-format="'dd/mm/yy'"
    hide-on-range-selection
  />
  <AppTextarea name="workContent" label="Nội dung làm việc" required />
  <AppTextarea name="note" label="Ghi chú" />
</template>
