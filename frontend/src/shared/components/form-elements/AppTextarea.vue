<script setup lang="ts">
import { APP_TEXTAREA_LIMIT, APP_TEXTAREA_ROW } from '@/shared/constants/common'
import { Message, Textarea } from 'primevue'
import { useField } from 'vee-validate'

type TProps = {
  name: string
  label?: string
  labelClass?: string
  size?: 'large' | 'small'
  placeholder?: string
  additionalErrorMessage?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  limitNumber?: number
  autoResize?: boolean
  rows?: number
  modelValue?: string
  hasLimitNumber?: boolean
}

type TEmits = {
  (event: 'change', value: string): void
  (event: 'blur', value: string): void
  (event: 'update:modelValue', value: string): void
}

const {
  name,
  rows = APP_TEXTAREA_ROW,
  label,
  labelClass,
  size,
  placeholder,
  additionalErrorMessage,
  required,
  readOnly,
  disabled,
  limitNumber = APP_TEXTAREA_LIMIT,
  hasLimitNumber = true
} = defineProps<TProps>()
const { value: inputValue, errorMessage } = useField<string | null>(() => name, undefined, {
  syncVModel: true
})
const emit = defineEmits<TEmits>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (limitNumber && hasLimitNumber) {
    const splicedValue = target?.value?.slice(0, limitNumber)
    inputValue.value = splicedValue
    emit('change', splicedValue)
  }
  inputValue.value = target.value
  emit('change', target.value)
}

const handleBlur = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('blur', target.value)
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-between">
      <span>
        <label
          v-if="label"
          :for="name"
          :class="['text-primary font-semibold', label ? labelClass || '' : '']"
          >{{ label }} <span v-if="required" class="text-red-500">*</span></label
        >
      </span>
      <span
        v-if="limitNumber && limitNumber > 0 && hasLimitNumber"
        class="text-primary font-semibold"
      >
        {{ inputValue?.length ?? 0 }}/{{ limitNumber }} ký tự
      </span>
      <span v-else></span>
    </div>
    <div>
      <Textarea
        v-model="inputValue"
        :name="name"
        @input="handleChange"
        @blur="handleBlur"
        :readonly="readOnly"
        :disabled="disabled"
        :draggable="false"
        :invalid="!!(errorMessage || additionalErrorMessage)"
        :auto-resize="false"
        :rows
        fluid
        :size
        :placeholder
        :maxlength="limitNumber && limitNumber > 0 && hasLimitNumber ? limitNumber : undefined"
      />
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
<style scoped>
textarea {
  resize: none;
}
</style>
