<script setup lang="ts">
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Dialog, type DialogBreakpoints } from 'primevue'
import { useForm } from 'vee-validate'
import type { CSSProperties } from 'vue'
import { ref } from 'vue'
import { z } from 'zod'
import AppFileInput from '../form-elements/AppFileInput.vue'
import AppTextarea from '../form-elements/AppTextarea.vue'

type TProps = {
  wrapperStyle?: CSSProperties
  title: string
  limitCharacterNumber?: number
  placeholder?: string
  cancelText?: string
  submitText?: string
  isMessageRequired?: boolean
  includedFiles?: boolean
  breakpoints?: DialogBreakpoints
  labelMessageInput?: string
  labelFileInput?: string
  rows?: number
}

type FormData = {
  message?: string
  files: File[] | null
}

type TEmits = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (event: 'submit', value: FormData, customData?: any): void
  (event: 'update:visible', value: boolean): void
}

const emits = defineEmits<TEmits>()

const {
  title,
  wrapperStyle = {},
  limitCharacterNumber = 250,
  rows,
  cancelText = 'Huỷ bỏ',
  submitText = 'Xác nhận',
  isMessageRequired = false,
  includedFiles = false,
  breakpoints,
  labelMessageInput,
  labelFileInput = 'File báo cáo'
} = defineProps<TProps>()
const schema = toTypedSchema(
  z.object({
    message: isMessageRequired
      ? requireStringSchema.max(limitCharacterNumber)
      : z.string().max(limitCharacterNumber).optional(),
    files: z.array(z.instanceof(File)).optional()
  })
)
const { defineField, handleSubmit, errors } = useForm<FormData>({
  validationSchema: schema,
  initialValues: { message: '' }
})

const [message] = defineField('message')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<any>()
const visible = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openModal = (customData?: any) => {
  if (customData) data.value = customData
  visible.value = true
  emits('update:visible', true)
}

const closeModal = async () => {
  visible.value = false
  emits('update:visible', false)
}

const onSubmit = handleSubmit((formData: FormData) => {
  emits('submit', formData, data.value)
})

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    data.value = undefined
  }
}

const handleChange = (newMessage: string) => {
  message.value = newMessage
}

defineExpose({
  openModal,
  closeModal
})
</script>
<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    :style="{ width: '400px', ...wrapperStyle }"
    :dismissableMask="true"
    :breakpoints
    :blockScroll="false"
    @update:visible="handleVisibleChange"
  >
    <form>
      <AppTextarea
        name="message"
        :errorMessage="errors?.message"
        :label="labelMessageInput"
        :required="isMessageRequired"
        :limit-number="limitCharacterNumber"
        :rows
        @change="handleChange"
        :placeholder
      ></AppTextarea>

      <AppFileInput v-if="includedFiles" name="files" :multiple="true">
        <template #trigger-element="{ triggerFunction }">
          <div class="inline-flex cursor-pointer items-center gap-1" @click="triggerFunction">
            <span class="icon-[icon-park-outline--upload-logs] text-lg text-[#9DA2AE]"></span>
            <span class="underline">{{ labelFileInput }}</span>
          </div>
        </template>
      </AppFileInput>
    </form>
    <template #footer>
      <Button :label="cancelText" severity="secondary" @click="closeModal" />
      <Button :label="submitText" type="submit" @click="onSubmit" />
    </template>
  </Dialog>
</template>
