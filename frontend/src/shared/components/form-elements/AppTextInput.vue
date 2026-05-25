<script setup lang="ts">
import {
  IconField,
  InputIcon,
  InputText,
  Message,
  type InputTextPassThroughOptions
} from 'primevue'
import { useField } from 'vee-validate'
import type { CSSProperties } from 'vue'
import { Tippy } from 'vue-tippy'

type TProps = {
  name: string
  label?: string
  size?: 'large' | 'small'
  placeholder?: string
  modelValue?: string
  additionalErrorMessage?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  hintContent?: string
  labelClass?: string
  iconClass?: string
  inputStyle?: CSSProperties
  inputClass?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputPt?: InputTextPassThroughOptions<any>
}

type TEmits = {
  (event: 'change', value: string): void
  (event: 'blur', value: string): void
  (event: 'update:modelValue', value: string): void
}

const {
  name,
  label,
  size,
  placeholder,
  additionalErrorMessage,
  required,
  readOnly,
  disabled,
  hintContent,
  iconClass,
  inputStyle,
  inputClass
} = defineProps<TProps>()
const { value, errorMessage } = useField<string | null>(() => name, undefined, { syncVModel: true })
const emit = defineEmits<TEmits>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('change', target.value)
}

const handleBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
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
      <Tippy v-if="!!hintContent" :content="hintContent" :allow-h-t-m-l="true">
        <span class="pi pi-question-circle text-primary cursor-pointer"></span>
      </Tippy>
    </div>
    <div>
      <IconField>
        <InputIcon v-if="$slots.prefixIcon" class="inline-block h-full" :class="iconClass">
          <slot name="prefixIcon"></slot>
        </InputIcon>
        <InputText
          :disabled
          v-model="value"
          @input="handleChange"
          @blur="handleBlur"
          :name="name"
          :readonly="readOnly"
          :invalid="!!(errorMessage || additionalErrorMessage)"
          fluid
          :size
          :placeholder
          :class="inputClass"
          :style="inputStyle"
          :pt="inputPt"
        />
        <InputIcon v-if="$slots.suffixIcon">
          <slot name="suffixIcon"></slot>
        </InputIcon>
      </IconField>
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
