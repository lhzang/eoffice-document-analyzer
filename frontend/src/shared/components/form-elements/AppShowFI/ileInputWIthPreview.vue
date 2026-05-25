<script setup lang="ts" generic="IsMulti extends boolean">
import { Tippy } from 'vue-tippy'

type TProps = {
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  fileUrl: string
  fileName: string
  label
}
const {
  placeholder = 'Tải file lên...',
  required,
  readOnly,
  disabled,
  fileUrl,
  fileName
} = defineProps<TProps>()
</script>
<template>
  <div class="h-full w-full">
    <label v-if="label" class="text-primary font-semibold"
      >{{ label }} <span v-if="required" class="text-red-500">*</span></label
    >
    <div
      :class="`border border-solid py-[var(--p-inputtext-padding-y)] pl-[.75rem] ${(errorMessage ?? additionalErrorMessage) ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} transition duration-200 ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
      :style="{
        paddingInlineEnd: 'calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size))'
      }"
    >
      <div v-if="multiple ? (fileValues as File[])?.length : fileValues">
        <div v-if="multiple">{{ (fileValues as File[]).length }} tệp</div>
        <div v-else>
          <div v-if="fileValues">
            <div class="flex items-center gap-1">
              <Tippy content="Xoá file tải lên" class="flex items-center">
                <span
                  @click="handleRemoveSingleFile"
                  class="icon-[eva--close-fill] text-primary text-xl"
                ></span>
              </Tippy>
              <Tippy :content="(fileValues as File).name" class="flex items-center truncate">
                <div class="w-full truncate">
                  {{ (fileValues as File).name }}
                </div>
              </Tippy>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-[var(--p-inputtext-disabled-color)]">{{ placeholder }}</div>
      <span
        class="icon-[icon-park-outline--upload-logs] absolute inset-y-1/2 right-2 -translate-y-1/2 text-xl text-[#9DA2AE]"
      ></span>
    </div>
  </div>
</template>
