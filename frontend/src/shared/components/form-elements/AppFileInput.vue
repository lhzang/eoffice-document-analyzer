<script setup lang="ts" generic="IsMulti extends boolean">
import { uniqBy } from 'lodash-es'
import { Chip, Message, useToast } from 'primevue'
import { useField } from 'vee-validate'
import { ref } from 'vue'
import { Tippy } from 'vue-tippy'

type TProps = {
  name: string
  label?: string
  // size?: 'large' | 'small';
  placeholder?: string
  additionalErrorMessage?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  maxFileNameLength?: number
  maxTotalFileSizeInMb?: number
  maxFileSizeInMb?: number
  accept?: string
  multiple?: IsMulti
  showFileList?: boolean
  multipleFileSelectMode?: 'append' | 'replace'
  modelValue?: IsMulti extends false ? File | null : File[] | null
}
const {
  name,
  label,
  placeholder = 'Tải file lên...',
  additionalErrorMessage,
  required,
  readOnly,
  disabled,
  maxFileNameLength = 250,
  maxTotalFileSizeInMb = 100,
  maxFileSizeInMb = 100,
  accept = '*',
  multiple = false,
  multipleFileSelectMode = 'append',
  showFileList = true
} = defineProps<TProps>()
const {
  value: fileValues,
  handleChange,
  errorMessage
} = useField<IsMulti extends false ? File | null : File[] | null>(() => name, undefined, {
  syncVModel: true
})
type TEmits = {
  (event: 'change', value: (IsMulti extends false ? File | null : File[] | null) | null): void
  (
    event: 'update:modelValue',
    value: (IsMulti extends false ? File | null : File[] | null) | null
  ): void
}
const emit = defineEmits<TEmits>()

const fileInput = ref<HTMLInputElement | null>(null)
const toast = useToast()

const triggerFileInput = () => {
  if (readOnly) return
  if (fileInput?.value) fileInput.value.value = ''
  fileInput?.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const fileList = target.files
  const files = fileList ? Array.from(fileList) : null
  let totalFileSize = 0
  const errorFile = files?.find((file) => {
    totalFileSize += file?.size
    if (totalFileSize > 1024 * 1024 * maxTotalFileSizeInMb) {
      toast.add({
        severity: 'error',
        life: 3000,
        summary: `Tổng kích cỡ file tải lớn hơn ${maxTotalFileSizeInMb}MB, vui lòng sửa lại!`
      })
      return true
    }
    if (encodeURIComponent(file?.name).length > maxFileNameLength) {
      toast.add({ severity: 'error', life: 3000, summary: 'Vui lòng rút ngắn tên file!' })
      return true
    }
    if (file?.size > 1024 * 1024 * maxFileSizeInMb) {
      toast.add({
        severity: 'error',
        life: 3000,
        summary: `Kích cỡ file tải lên lớn hơn ${maxFileSizeInMb}MB, vui lòng sửa lại!`
      })
      return true
    }
  })
  if (errorFile) return
  const selectedFiles = multiple
    ? multipleFileSelectMode === 'append'
      ? uniqBy(
          [...((fileValues.value as File[]) ?? []), ...(files ?? [])],
          (file) => `${file?.name}-${file?.size}`
        )
      : (files ?? null)
    : (files?.[0] ?? null)
  emit('change', selectedFiles as IsMulti extends false ? File | null : File[] | null)
  emit('update:modelValue', selectedFiles as IsMulti extends false ? File | null : File[] | null)
  handleChange(selectedFiles as IsMulti extends false ? File | null : File[] | null)
}

const handleRemoveSingleFile = (event: MouseEvent) => {
  event.stopPropagation()
  emit('change', null)
  emit('update:modelValue', null)
  handleChange(null)
}

const handleRemoveFileInList = (fileIndex: number) => {
  if (!multiple || !Array.isArray(fileValues.value)) return
  const newValue = fileValues.value?.filter((__, index) => index !== fileIndex)
  handleChange(newValue)
  emit('change', newValue as IsMulti extends false ? File | null : File[] | null)
  emit('update:modelValue', newValue as IsMulti extends false ? File | null : File[] | null)
}
</script>
<template>
  <div class="h-full w-full">
    <label v-if="label" :for="name" class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <slot name="trigger-element" :triggerFunction="triggerFileInput">
      <!-- default UI  -->
      <div
        :class="`border border-solid py-[var(--p-inputtext-padding-y)] pl-[.75rem] ${(errorMessage ?? additionalErrorMessage) ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} transition duration-200 ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
        @click="triggerFileInput"
        :style="{
          paddingInlineEnd: 'calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size))'
        }"
      >
        <div v-if="multiple ? (fileValues as File[])?.length : fileValues">
          <div v-if="multiple">{{ (fileValues as File[]).length }} tệp</div>
          <div v-else>
            <div v-if="fileValues">
              <div class="flex items-center gap-1">
                <Tippy content="Xoá file tải lên" class="mt-1 flex items-center">
                  <span
                    @click="handleRemoveSingleFile"
                    class="icon-[eva--close-fill] text-primary text-xl"
                  ></span>
                </Tippy>
                <Tippy class="flex items-center truncate">
                  <div class="w-full truncate">
                    {{ (fileValues as File).name }}
                  </div>
                  <template #content>
                    <div class="max-w-[400px] break-all">
                      {{ (fileValues as File).name }}
                    </div>
                  </template>
                </Tippy>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="truncate text-[var(--p-inputtext-disabled-color)]">
          {{ placeholder }}
        </div>
        <span
          class="icon-[icon-park-outline--upload-logs] absolute inset-y-1/2 right-2 -translate-y-1/2 text-xl text-[#9DA2AE]"
        ></span>
      </div>
    </slot>
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      @change="handleFileChange"
      :accept
      :multiple="!!multiple"
    />
    <Message
      v-if="!!(additionalErrorMessage || errorMessage)"
      severity="error"
      size="small"
      variant="simple"
    >
      {{ errorMessage ?? additionalErrorMessage }}
    </Message>
    <div v-if="showFileList && multiple" class="mt-3 max-h-[200px] overflow-y-auto">
      <Chip
        class="mt-1 mr-2 shrink-0 !px-[6px] !py-[4px]"
        :class="{
          '!mr-0': index === (fileValues as File[]).length ? (fileValues as File[]).length - 1 : 0
        }"
        v-for="(file, index) in fileValues as File[]"
        :key="file.name"
        :label="file?.name"
        removable
        @remove="() => handleRemoveFileInList(index)"
      />
    </div>
  </div>
</template>
