<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import type { TDocumentType } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT, MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, Checkbox, useToast } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { useTemplateRef } from 'vue'
import { z } from 'zod'
import { useGetListAdminDocTypes } from '../../composables/adminDocumentType/queries/useGetListAdminDocTypes'
import { useAddDocumentBook } from '../../composables/documentBook/queries/useAddDocumentBook'
import {
  DOCUMENT_BOOK_TYPES_VALUES,
  listDocumentBookTypeOptions
} from '../../constants/documentBook'

type TProps = {
  selectedUnitId: string
  hasCreateInternal: boolean
  hasCreateOtherType: boolean
}
type ModalType = InstanceType<typeof AppModal>

const props = defineProps<TProps>()

const schema = toTypedSchema(
  z.object({
    bookName: requireStringSchema,
    shortName: requireStringSchema,
    startCount: z
      .number({ error: MSG_REQUIRED_FIELD })
      .positive({ message: 'Số bắt đầu của số phải lớn hơn 0' }),
    documentBookType: z.custom<TCommonSelectOptions<TDocumentType>>(
      (val) => {
        return val !== null && val !== undefined
      },
      { message: MSG_REQUIRED_FIELD }
    ),
    documentTypes: z.array(z.string()),
    lockedDate: z.date().optional().nullable(),
    isNonOrdinal: z.boolean()
  })
)

const { defineField, handleSubmit, errors, resetForm, setFieldValue, resetField, values } = useForm(
  {
    validationSchema: schema,
    initialValues: {
      bookName: '',
      shortName: '',
      startCount: 1,
      documentTypes: [],
      isNonOrdinal: false
    }
  }
)

const { value: isNonOrdinal } = useField('isNonOrdinal')
const { value: documentTypes } = useField<string[]>('documentTypes')

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const toast = useToast()

const queryClient = useQueryClient()

const { data: dataListDocTypes, isLoading: isLoadingListAdminDocTypes } = useGetListAdminDocTypes(
  () => ({}),
  {
    enabled: () => !!modalRef?.value?.visible
  }
)

const { mutate: addDocumentBook, isPending: isLoadingAddBook } = useAddDocumentBook({
  onSuccess: () => {
    toastSucceed({ summary: 'Thêm mới sổ văn bản thành công' })
    queryClient.invalidateQueries({
      queryKey: ['getDocumentBooks']
    })
    modalRef.value?.closeModal()
  }
})

const onSubmit = handleSubmit((values) => {
  addDocumentBook(
    cleanObject({
      name: values.bookName,
      shortName: values.shortName,
      startCount: values.startCount,
      bookType: values.documentBookType.value,
      documentTypeIds: values.documentTypes,
      unitId: props?.selectedUnitId,
      lockedDate: values?.lockedDate
        ? DateTime.fromJSDate(fromJsvalues?.lockedDate).toISODate()
        : undefined,
      ordinalType: values?.isNonOrdinal ? 'NON_ORDINAL' : 'NORMAL'
    })
  )
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) resetForm()
}
const handleGenDocTypeOptions = () => {
  console.log(listDocumentBookTypeOptions, props, 'listDocumentBookTypeOptions')
  return {
    options: listDocumentBookTypeOptions?.filter((type) => {
      return type?.value === DOCUMENT_BOOK_TYPES_VALUES.internalDoc
        ? props.hasCreateInternal
        : props.hasCreateOtherType
    }),
    hasMore: false
  }
}

const handleToggleSelectAllTypes = () => {
  if (!dataListDocTypes?.value?.docs?.length) return
  if (dataListDocTypes?.value?.docs?.length === documentTypes?.value?.length) {
    documentTypes.value = []
  } else {
    documentTypes.value = dataListDocTypes?.value?.docs?.map((docType) => docType.id!) ?? []
  }
}

const handleSelectBookType = (opt: TCommonSelectOptions<TDocumentType>) => {
  resetField('lockedDate')
  resetField('isNonOrdinal')
}

defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal
    class="w-[900px]!"
    ref="modalRef"
    title="Tạo sổ văn bản mới"
    @update:visible="handleChangeModalVisible"
  >
    <form @submit="onSubmit">
      <div class="grid grid-cols-4 gap-x-4 gap-y-2">
        <AppSelect
          class="col-span-2"
          name="documentBookType"
          label="Loại sổ văn bản"
          required
          :placeholder="MSG_PLEASE_SELECT"
          :fetch-options="handleGenDocTypeOptions"
          @select="handleSelectBookType"
          :multiple="false"
        ></AppSelect>
        <AppTextInput
          class="col-span-2"
          name="bookName"
          label="Tên sổ văn bản"
          required
          placeholder="Nhập tên sổ văn bản..."
          :error-message="errors?.bookName"
        ></AppTextInput>
        <AppTextInput
          name="shortName"
          label="Ký hiệu"
          placeholder="Nhập số ký hiệu..."
          required
          :error-message="errors?.shortName"
        ></AppTextInput>
        <AppNumberInput
          name="startCount"
          label="Số bắt đầu"
          placeholder="Nhập số bắt đầu của sổ..."
          required
          :error-message="errors?.startCount"
        ></AppNumberInput>

        <AppDateInput
          v-if="
            values?.documentBookType &&
            values?.documentBookType?.value === DOCUMENT_BOOK_TYPES_VALUES.internalDoc
          "
          class="col-span-2"
          name="lockedDate"
          date-format="dd/mm/yy"
          :append-to="'body'"
          auto-z-index
          label="Ngày khóa sổ"
          :placeholder="MSG_PLEASE_SELECT"
        />
        <div
          v-if="
            values?.documentBookType &&
            values?.documentBookType?.value === DOCUMENT_BOOK_TYPES_VALUES.outDoc
          "
          class="col-span-4 flex items-center gap-2"
        >
          <Checkbox v-model="isNonOrdinal" id="isNonOrdinal" name="isNonOrdinal" binary />
          <label for="isNonOrdinal"> Không sử dụng số hiệu </label>
        </div>
      </div>
      <div
        v-if="isLoadingListAdminDocTypes"
        class="mt-10 flex h-[200px] items-center justify-center"
      >
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div class="mt-10" v-else>
        <div class="text-primary mb-3 font-bold">Loại văn bản</div>
        <div
          v-if="!dataListDocTypes?.docs?.length"
          class="flex h-[200px] w-full flex-col items-center justify-center"
        >
          <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
          <span class="text-lg font-medium text-gray-400">Đơn vị chưa có loại văn bản</span>
        </div>
        <div v-else>
          <div class="mb-2 flex items-center gap-2">
            <Checkbox
              inputId="all"
              name="documentTypesCheck"
              :value="
                !!dataListDocTypes?.docs?.length &&
                dataListDocTypes?.docs?.length === documentTypes?.length
              "
              binary
              @change="handleToggleSelectAllTypes"
            />
            <label for="all">Chọn tất cả</label>
          </div>
          <div class="grid grid-cols-4 gap-y-2">
            <div
              v-for="(docType, idx) of dataListDocTypes?.docs"
              :key="idx"
              class="flex items-center gap-2"
            >
              <Checkbox
                :inputId="docType.id"
                name="documentTypes"
                :value="docType.id"
                v-model="documentTypes"
              />
              <label :for="docType.id">{{ docType.name }}</label>
            </div>
          </div>
        </div>
      </div>
      <slot name="footer">
        <div class="mt-6 flex w-full justify-end">
          <Button
            label="Xác nhận"
            type="submit"
            :disabled="isLoadingAddBook || isLoadingListAdminDocTypes"
            :loading="isLoadingAddBook"
          />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
