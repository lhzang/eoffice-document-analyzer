<script setup lang="ts">
import {
  InputNumber,
  Message,
  type InputNumberBlurEvent,
  type InputNumberInputEvent
} from 'primevue'
import { useField } from 'vee-validate'
import { watchEffect } from 'vue'
type TProps = {
  name: string
  label?: string
  fluid?: boolean
  size?: 'small' | 'large'
  additionalErrorMessage?: string
  placeholder?: string
  prefix?: string
  suffix?: string
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  useGrouping?: boolean
  min?: number
  max?: number
  modelValue?: number
  defaultValue?: number
  inputStyle?: Partial<CSSStyleDeclaration>
  inputClass?: string
  inputContainerClass?: string
  labelClass?: string
  allowEmpty?: boolean
  invalid?: boolean
}

type TEmits = {
  (event: 'change', value: number | null): void
  (event: 'blur', value: number | null): void
  (event: 'input', value: number | null): void
  (event: 'update:modelValue', value: number | null): void
}

// const props = defineProps<TProps>()

const {
  name,
  label,
  size,
  additionalErrorMessage,
  placeholder,
  prefix,
  suffix,
  required,
  readonly,
  disabled,
  fluid = true,
  modelValue,
  defaultValue,
  invalid = false,
  allowEmpty = true,
  useGrouping,
  min,
  max,
  inputStyle,
  inputClass,
  inputContainerClass,
  labelClass
} = defineProps<TProps>()

const { value, errorMessage, setValue } = useField<number | null>(() => name, undefined, {
  syncVModel: true
})

const emit = defineEmits<TEmits>()

const handleChange = (newValue: number) => {
  emit('change', newValue)
}
const handleInput = (event: InputNumberInputEvent) => {
  if (event.value === '-') return

  // const target = event.originalEvent.target as HTMLElement
  // target.blur()
  // target.focus()
  emit('input', event.value ? Number(event?.value) : null)
}

const handleBlur = (event: InputNumberBlurEvent) => {
  emit('blur', event.value ? Number(event?.value) : null)
}
watchEffect(() => {
  if (Number.isInteger(modelValue)) setValue(modelValue ?? null)
})
</script>

<template>
  <div class="flex h-full flex-col">
    <label
      v-if="label"
      :for="name"
      :class="['text-primary font-semibold', label ? labelClass || '' : '']"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <InputNumber
      class="flex items-center"
      :class="inputContainerClass"
      v-model="value"
      @value-change="handleChange"
      :name="name"
      :allowEmpty="allowEmpty"
      :size
      :placeholder
      :prefix
      :defaultValue="defaultValue"
      :suffix
      :readonly
      :disabled
      :invalid="!!(additionalErrorMessage || errorMessage) || invalid"
      :fluid
      :useGrouping
      @blur="handleBlur"
      @input="handleInput"
      :min
      :max
      :inputClass="`${inputClass}`"
      :inputStyle="inputStyle"
    >
    </InputNumber>
    <Message
      v-if="!!(additionalErrorMessage || errorMessage)"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ errorMessage ?? additionalErrorMessage }}
    </Message>
  </div>
</template>
