<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import { z } from 'zod'

import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'

import type { TUrgencyLevelValue } from '@/shared/models/document'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { cleanObject } from '@/shared/utils/common'
import { getUrgencyLevelSelectData } from '@/shared/utils/document'
import { useDebounceFn } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { DateTime } from 'luxon'
import type { TCommonIndocFilter } from '../models/types'

type MethodModalType = InstanceType<typeof AppModal>

const formFilterZodSchema = z.object({
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  documentTypes: z
    .array(
      z.object({
        label: z.string(),
        value: z.string()
      })
    )
    .optional(),
  urgentLevels: z.array(z.custom<TCommonSelectOptions<TUrgencyLevelValue>>()).optional()
})

type TFormData = z.infer<typeof formFilterZodSchema>
type TEmits = {
  (event: 'submit', value: TCommonIndocFilter | null): void
  (event: 'update:visible', value: boolean): void
}

const props = defineProps<{
  placeholder?: string
  isEDoc?: boolean
  filterValues: TCommonIndocFilter
}>()

const { placeholder = 'Trích yếu/Số ký hiệu/Nơi gửi/Số đến...', isEDoc = false } = props

const formFilterTypeSchema = toTypedSchema(formFilterZodSchema)

const modalRef = useTemplateRef<MethodModalType | null>('modalRef')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchValue = ref<string>('')
const formValues = ref<TFormData>()

const emits = defineEmits<TEmits>()

const { handleSubmit, resetForm, values } = useForm<TFormData>({
  validationSchema: formFilterTypeSchema
})

const openModal = () => {
  modalRef.value?.openModal()
}

//cached for submitted data
const convertFormData = computed(
  (): TCommonIndocFilter =>
    cleanObject({
      search: searchValue.value?.trim() || '',
      startDate: formValues.value?.startDate
        ? DateTime.fromJSDate(formValues.value?.startDate).toFormat('yyyy-MM-dd')
        : undefined,
      endDate: formValues.value?.endDate
        ? DateTime.fromJSDate(formValues.value?.endDate).toFormat('yyyy-MM-dd')
        : undefined,
      documentTypes: formValues.value?.documentTypes,
      urgentLevels: formValues.value?.urgentLevels
    })
)

//this use for debounce when typing search
const debouncedEmitSubmit = useDebounceFn(() => {
  emits('submit', convertFormData.value)
}, 500)

//submit/clear search case
const emitSubmit = () => {
  emits('submit', convertFormData.value)
}

const onSubmit = handleSubmit((formData: TFormData) => {
  formValues.value = formData
  emitSubmit()
  modalRef?.value?.closeModal()
})

const handleResetForm = () => {
  emits('submit', null)
  searchValue.value = ''
  formValues.value = undefined
  resetForm()
  modalRef?.value?.closeModal()
}

const handleInput = () => {
  //prevent search when type spaces only
  if (searchValue.value?.length && !searchValue?.value?.trim()?.length) return
  debouncedEmitSubmit()
}

const handleClearSearch = () => {
  searchValue.value = ''
  emitSubmit()
}

const handleModalFilterOpen = (isOpen: boolean) => {
  if (isOpen) {
    searchValue.value = props.filterValues?.search as string
    formValues.value = cleanObject({
      documentTypes: props.filterValues?.documentTypes,
      urgentLevels: props.filterValues?.urgentLevels,
      startDate: props.filterValues?.startDate ? new Date(props.filterValues.startDate) : undefined,
      endDate: props.filterValues?.endDate ? new Date(props.filterValues?.endDate) : undefined
    })
    resetForm({
      values: {
        documentTypes: props.filterValues?.documentTypes,
        urgentLevels: props.filterValues?.urgentLevels,
        startDate: props.filterValues?.startDate
          ? new Date(props.filterValues?.startDate)
          : undefined,
        endDate: props.filterValues?.endDate ? new Date(props.filterValues?.endDate) : undefined
      }
    })
  }
}
</script>

<template>
  <div>
    <div
      class="border-surface-300 inline-flex w-[300px] items-center rounded-xl border-[1px] bg-white px-2 py-1 focus-within:border-[1px] focus-within:border-[var(--p-primary-color)]"
      @click="searchInputRef?.focus()"
    >
      <span
        class="custom-input--icon__search shrink-0 pl-2 text-2xl text-gray-500"
        :class="'icon-[line-md--search]'"
      />
      <input
        ref="searchInputRef"
        name="searchInput"
        class="w-full border-[1px] border-none px-2 py-1 outline-none"
        :placeholder="placeholder"
        v-model="searchValue"
        @input="handleInput"
      />
      <span
        v-if="searchValue?.trim()"
        class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
        :class="'icon-[line-md--close-circle-filled]'"
        @click="handleClearSearch"
      />
      <div class="relative flex items-center justify-center">
        <span
          class="rounded-xl text-2xl text-gray-500 hover:cursor-pointer active:text-gray-600"
          :class="'icon-[line-md--filter-alt]'"
          @click.stop="openModal"
        />
        <div
          v-if="isEmpty(convertFormData) === false"
          class="bg-primary absolute top-0 right-0 h-2.5 w-2.5 rounded-full"
        ></div>
      </div>
    </div>
    <AppModal
      ref="modalRef"
      :wrapper-style="{ width: '60%' }"
      @update:visible="handleModalFilterOpen"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-primary text-2xl font-bold">Lọc</span>
          <span class="text-primary text-2xl" :class="'icon-[line-md--filter-alt]'" />
        </div>
      </template>
      <form @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <AppDateInput
            name="startDate"
            label="Từ ngày"
            placeholder="Chọn ngày bắt đầu"
            :date-format="'dd/mm/yy'"
            :append-to="'body'"
            auto-z-index
            :max-date="values.endDate ? new Date(values.endDate) : undefined"
          />

          <AppDateInput
            name="endDate"
            label="Đến ngày"
            placeholder="Chọn ngày kết thúc"
            :date-format="'dd/mm/yy'"
            :append-to="'body'"
            auto-z-index
            :min-date="values.startDate ? new Date(values.startDate) : undefined"
          />
          <AppSelect
            name="documentTypes"
            :fetch-options="fetchMoreDocumentTypeOptions"
            v-if="!isEDoc"
            multiple
            label="Loại văn bản"
            placeholder="Chọn loại văn bản"
            :searchable="true"
            :append-to-body="true"
          />
          <AppSelect
            name="urgentLevels"
            :fetch-options="getUrgencyLevelSelectData"
            v-if="!isEDoc"
            multiple
            label="Độ khẩn"
            placeholder="Độ khẩn"
            :searchable="false"
            :append-to-body="true"
          />
        </div>
        <div class="mt-5 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Đặt lại"
            severity="secondary"
            @click="handleResetForm"
          />
          <Button type="submit" class="min-w-[100px]" label="Tìm" outlined severity="primary" />
        </div>
      </form>
    </AppModal>
  </div>
</template>
