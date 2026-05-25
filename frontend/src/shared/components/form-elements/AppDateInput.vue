<script setup lang="ts">
import { omit } from 'lodash-es'
import { DatePicker, Message, type DatePickerBlurEvent, type DatePickerProps } from 'primevue'
import { useField } from 'vee-validate'

type TProps = Partial<
  Omit<DatePickerProps, 'name' | 'required' | 'showIcon' | 'fluid' | 'iconDisplay' | 'showClear'>
> & {
  name: string
  label?: string
  modelValue?: Date | Array<Date> | Array<Date | null> | null | undefined
  additionalErrorMessage?: string
  required?: boolean
  clearable?: boolean
  preventSelectSameRangeValue?: boolean
}

type TEmits = {
  (event: 'change', value: Date | Date[] | (Date | null)[] | null | undefined): void
  (event: 'blur', value: string): void
  (event: 'update:modelValue', value: Date | Date[] | (Date | null)[] | null | undefined): void
  (event: 'hide', value: Date | Date[] | (Date | null)[] | null | undefined): void
  (event: 'clear'): void
}

const {
  name,
  label,
  additionalErrorMessage,
  required,
  clearable = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modelValue,
  placeholder = 'Chọn ngày',
  manualInput = false,
  autoZIndex = true,
  ...datePickerProps
} = defineProps<TProps>()
const { value, errorMessage } = useField<
  Date | Array<Date> | Array<Date | null> | undefined | null
>(() => name, undefined, { syncVModel: true })
const emit = defineEmits<TEmits>()

const handleChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  emit('change', value)
}

const handleBlur = (event: DatePickerBlurEvent) => {
  emit('blur', event.value)
}
const handleHidePanel = () => {
  emit('hide', value?.value)
}
const handleClear = () => {
  emit('clear')
}
</script>
<template>
  <div class="flex flex-col">
    <label v-if="label" :for="name" class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <DatePicker
      v-model="value"
      showIcon
      fluid
      :manualInput
      iconDisplay="input"
      :autoZIndex
      :show-clear="clearable && !disabled && !readonly && !required"
      v-bind="omit(datePickerProps, 'modelValue')"
      :name="name"
      :showOnFocus="true"
      :placeholder
      @value-change="handleChange"
      @blur="handleBlur"
      @hide="handleHidePanel"
      :pt="{
        pcInputText: {
          root: errorMessage || additionalErrorMessage ? 'p-invalid' : ''
        }
      }"
    >
      <template #clearicon="{ clearCallback }">
        <i
          class="pi pi-times p-icon p-datepicker-clear-icon"
          @click="
            (e) => {
              clearCallback(e)
              handleClear()
            }
          "
          :style="{
            display:
              clearable &&
              !disabled &&
              !readonly &&
              !required &&
              (Array.isArray(value) ? value?.[0] || value?.[1] : value)
                ? 'block'
                : 'none'
          }"
        />
      </template>
    </DatePicker>
    <div>
      <Message
        v-if="!!(errorMessage || additionalErrorMessage)"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ errorMessage ?? additionalErrorMessage }}
      </Message>
    </div>
  </div>
</template>
