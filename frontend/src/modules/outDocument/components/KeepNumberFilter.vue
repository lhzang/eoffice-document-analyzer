<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { z } from 'zod'

import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'

import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import { optionalUnitSchema } from '@/shared/schemas/commonSchema'
import type { TenantWithNameOnlyVM } from '@/shared/services/api'
import { fetchMoreDocumentBookOptions } from '@/shared/utils/clerical/getDocBookOption'
import { cleanObject } from '@/shared/utils/common'
import { useDebounceFn } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { NUMBER_REGISTER_STATUS_LABELS, type TNumberRegisterStatus } from '../constants/keepNumber'
import type { TRegistedNumberFilter } from '../models/keepNumber'
import type { ownBookUnitSchema } from '../schemas/keepNumberSchema'

type TModalType = InstanceType<typeof AppModal>
type TFormData = z.infer<typeof formFilterZodSchema>
type TUnitSchema = z.infer<typeof ownBookUnitSchema>

const formFilterZodSchema = z.object({
  ownBookUnit: optionalUnitSchema,
  documentBook: z.custom<TCommonSelectOptions<string>[]>().optional(),
  status: z.custom<TCommonSelectOptions<TNumberRegisterStatus>[]>().optional()
})

type TEmits = {
  (event: 'submit', value: TRegistedNumberFilter | null): void
  (event: 'update:visible', value: boolean): void
}

const {
  placeholder = 'Nhập nội dung cần tìm kiếm...',
  chooableHasStampUnits,
  isLoadingUnitData,
  filterValues
} = defineProps<{
  placeholder?: string
  filterValues: TRegistedNumberFilter
  chooableHasStampUnits: TenantWithNameOnlyVM[]
  isLoadingUnitData: boolean
}>()

const modalRef = useTemplateRef<TModalType | null>('modalRef')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchValue = ref<string>(filterValues?.search ?? '')
const formValues = ref<TFormData>()

const emits = defineEmits<TEmits>()

const { handleSubmit, resetForm, values, setValues } = useForm({
  validationSchema: toTypedSchema(formFilterZodSchema)
})

const {
  setValue: setOwnBookUnit,
  value: ownBookUnit,
  errorMessage: ownBookUnitErrMsg
} = useField<TUnitSchema>('ownBookUnit')

const openModal = () => {
  modalRef.value?.openModal()
}

//cached for submitted data
const convertFormData = computed(
  (): TRegistedNumberFilter =>
    cleanObject({
      search: searchValue.value?.trim() || '',
      ownBookUnit: formValues?.value?.ownBookUnit as TUnitSelectValue | null,
      documentBook: formValues?.value?.documentBook,
      status: formValues?.value?.status
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

const onSubmit = handleSubmit((formData) => {
  setValues(formData)
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

const fetchUnitsByPermission = async (searchString?: string) => {
  return {
    options:
      chooableHasStampUnits
        ?.map((unit) => ({
          label: unit?.name,
          value: unit?.id
        }))
        ?.filter((opt) =>
          opt?.label?.toLowerCase()?.includes((searchString ?? '')?.trim().toLowerCase())
        ) ?? [],
    hasMore: false
  }
}

const handleSelectOwnBookUnit = (submitValue: TCommonSelectOptions<string>) => {
  setOwnBookUnit(submitValue)
}

const handleGenBookOpts = (search: string, page: number) => {
  if (ownBookUnit?.value?.value) {
    return fetchMoreDocumentBookOptions(
      search,
      page,
      ownBookUnit?.value?.value,
      ['OUTGOING_DOCUMENT'],
      DOCUMENT_BOOK_STATUS.OPEN
    )
  } else
    return {
      options: [],
      hasMore: false
    }
}

const handleGenStatusOpts = () => {
  return {
    options: Object.entries(NUMBER_REGISTER_STATUS_LABELS).map(([value, label]) => ({
      label,
      value
    })),
    hasMore: false
  }
}

const handleModalFilterOpen = (isOpen: boolean) => {
  if (isOpen) {
    searchValue.value = filterValues?.search as string
    formValues.value = cleanObject({
      ownBookUnit: filterValues?.ownBookUnit as TUnitSelectValue | null,
      documentBook: filterValues?.documentBook,
      status: filterValues?.status
    })
    resetForm({
      values: {
        ownBookUnit: filterValues?.ownBookUnit as TUnitSelectValue | null,
        documentBook: filterValues?.documentBook,
        status: filterValues?.status
      }
    })
  }
}

watch(
  () => filterValues,
  (filterValues) => {
    searchValue.value = filterValues?.search ?? ''
  }
)
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
      :wrapper-style="{ width: '400' }"
      @update:visible="handleModalFilterOpen"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <span class="text-primary text-2xl font-bold">Lọc</span>
          <span class="text-primary text-2xl" :class="'icon-[line-md--filter-alt]'" />
        </div>
      </template>
      <form @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <AppSelect
            label="Đơn vị giữ sổ"
            required
            :placeholder="MSG_PLEASE_SELECT"
            name="ownBookUnit"
            :disabled="isLoadingUnitData"
            searchable
            @select="handleSelectOwnBookUnit"
            :fetch-options="fetchUnitsByPermission"
          ></AppSelect>
          <AppSelect
            label="Sổ văn bản"
            placeholder="Chọn sổ văn bản"
            name="documentBook"
            searchable
            :multiple="true"
            :disabled="!ownBookUnit?.value"
            :fetch-options="handleGenBookOpts"
            :cacheUniqs="[ownBookUnit?.value || '']"
          />
          <AppSelect
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            name="status"
            :multiple="true"
            :fetch-options="handleGenStatusOpts"
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
