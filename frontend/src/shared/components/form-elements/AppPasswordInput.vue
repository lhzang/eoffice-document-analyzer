<script setup lang="ts">
import { IconField, InputIcon, Password, Message } from 'primevue'
import { useField } from 'vee-validate'
import { Tippy } from 'vue-tippy'

type TProps = {
  name: string
  label?: string
  size?: 'large' | 'small'
  placeholder?: string
  additionalErrorMessage?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  hintContent?: string
  labelClass?: string
}

type TEmits = {
  (event: 'change', value: string): void
  (event: 'blur', value: string): void
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
  hintContent
} = defineProps<TProps>()
const { value, errorMessage } = useField<string | null>(() => name)

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
      <Tippy v-if="!!hintContent" :content="hintContent" :allowHTML="true">
        <span class="pi pi-question-circle text-primary cursor-pointer"></span>
      </Tippy>
    </div>
    <div>
      <IconField>
        <InputIcon v-if="$slots.prefixIcon">
          <slot name="prefixIcon"></slot>
        </InputIcon>
        <Password
          :feedback="false"
          toggleMask
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
