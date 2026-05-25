<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_REQUIRED_FIELD } from '@/shared/constants/message-text'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import type { ListDocumentBooksVM } from '@/shared/services/api'
import { toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox, useToast } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, useTemplateRef, watch } from 'vue'
import { z } from 'zod'
import { useGetDetailDocumentBook } from '../../../../shared/composables/queries/clerical/useGetDetailDocumentBook'
import { useGetListAdminDocTypes } from '../../composables/adminDocumentType/queries/useGetListAdminDocTypes'
import { useEditDocumentBook } from '../../composables/documentBook/queries/useEditDocumentBook'

type TProps = {
  hasManagePerm: boolean
  hasEditStartNumberPerm: boolean
}

type ModalType = InstanceType<typeof AppModal>

const props = defineProps<TProps>()

const schema = toTypedSchema(
  z.object({
    bookName: requireStringSchema,
    shortName: requireStringSchema,
    startCount: props.hasEditStartNumberPerm
      ? z
          .number({ error: MSG_REQUIRED_FIELD })
          .positive({ message: 'Số bắt đầu của số phải lớn hơn 0' })
          .superRefine((value, ctx) => {
            const startCount = detailDocumentBook?.value?.startCount
            const usedNumbers = detailDocumentBook?.value?.usedNumberOrdinals ?? []
            const registeredNumbers = detailDocumentBook?.value?.registeredNumbers ?? []
            const allNumbers = new Set([...usedNumbers, ...registeredNumbers])
            if (
              (value !== startCount && startCount && value <= startCount) ||
              (allNumbers?.size && allNumbers?.has(value))
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['startCount'],
                message:
                  'Số bắt đầu phải lớn hơn số hiện tại và không được trùng với số đã sử dụng hoặc đã đăng ký giữ số'
              })
            }
          })
      : z.number().optional(),
    documentTypes: z.array(z.string())
  })
)

const { handleSubmit, errors, handleReset, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    bookName: '',
    shortName: '',
    // startCount: 0,
    documentTypes: []
  }
})

const { value: documentTypes } = useField<string[]>('documentTypes')

const documentBook = ref<ListDocumentBooksVM | null>(null)

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const toast = useToast()

const queryClient = useQueryClient()

const { data: detailDocumentBook, isLoading: isGettingDetailData } = useGetDetailDocumentBook(
  () => documentBook?.value?.id!,
  {
    enabled: () => !!documentBook?.value?.id
  }
)

const {
  data: dataListDocTypes,
  isLoading: isLoadingListAdminDocTypes,
  isSuccess: isGetListAdminDocTypeSuccess
} = useGetListAdminDocTypes(() => ({}), {
  enabled: () => !!modalRef?.value?.visible
})

const { mutate: editDocumentBook, isPending: isLoadingAddBook } = useEditDocumentBook({
  onSuccess: () => {
    toastSucceed({ summary: 'Cập nhật sổ văn bản thành công' })
    queryClient.invalidateQueries({
      queryKey: ['getDocumentBooks']
    })
    modalRef.value?.closeModal()
  }
})

const onSubmit = handleSubmit((values) => {
  if (!detailDocumentBook?.value?.id) return
  editDocumentBook({
    id: detailDocumentBook?.value?.id,
    bookData: props?.hasManagePerm
      ? {
          name: values.bookName,
          shortName: values.shortName,
          documentTypeIds: values.documentTypes
        }
      : undefined,
    startCount: props?.hasEditStartNumberPerm ? values?.startCount : undefined
  })
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) {
    documentBook.value = null
    handleReset()
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

watch(
  [isGetListAdminDocTypeSuccess, () => modalRef?.value?.visible, detailDocumentBook],
  ([isGetSuccess, isVisible, detailDocumentBook]) => {
    if (isGetSuccess && isVisible && detailDocumentBook) {
      setValues({
        bookName: detailDocumentBook?.name,
        shortName: detailDocumentBook?.code,
        startCount: detailDocumentBook?.startCount,
        documentTypes: (dataListDocTypes?.value?.docs ?? [])
          ?.filter((adminDocType) =>
            detailDocumentBook?.documentTypeVMList?.some(
              (type) => type?.id === adminDocType.id! && !!type?.id
            )
          )
          ?.map((type) => type?.id)
      })
    }
  }
)

defineExpose({
  openModal: (data: ListDocumentBooksVM) => {
    documentBook.value = data
    modalRef.value?.openModal()
  },
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal
    class="w-[900px]!"
    ref="modalRef"
    title="Cập nhật sổ văn bản"
    @update:visible="handleChangeModalVisible"
    :isLoading="isGettingDetailData"
  >
    <form @submit="onSubmit">
      <div class="grid grid-cols-4 gap-x-4 gap-y-2">
        <AppTextInput
          :disabled="!props.hasManagePerm"
          class="col-span-2"
          name="bookName"
          label="Tên sổ văn bản"
          required
          placeholder="Nhập tên sổ văn bản..."
          :error-message="errors?.bookName"
        ></AppTextInput>
        <AppTextInput
          :disabled="!props.hasManagePerm"
          name="shortName"
          label="Ký hiệu"
          placeholder="Nhập số ký hiệu..."
          required
          :error-message="errors?.shortName"
        ></AppTextInput>
        <AppNumberInput
          :disabled="!props.hasEditStartNumberPerm"
          name="startCount"
          label="Số bắt đầu"
          placeholder="Nhập số bắt đầu của sổ..."
          required
          :error-message="errors?.startCount"
        ></AppNumberInput>
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
              :default-value="
                !!dataListDocTypes?.docs?.length &&
                dataListDocTypes?.docs?.length === documentTypes?.length
              "
              binary
              @change="handleToggleSelectAllTypes"
              :disabled="!props.hasManagePerm"
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
                :disabled="!props.hasManagePerm"
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
            :disabled="
              isLoadingAddBook ||
              isLoadingListAdminDocTypes ||
              (!props.hasManagePerm && !props.hasEditStartNumberPerm)
            "
            :loading="isLoadingAddBook"
          />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
