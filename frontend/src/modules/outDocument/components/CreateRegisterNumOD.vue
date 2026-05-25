<script setup lang="ts">
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { useCreateRegisterNumOD } from '@/shared/composables/queries/clerical/useCreateRegisterNumOD'
import { useGetDetailDocumentBook } from '@/shared/composables/queries/clerical/useGetDetailDocumentBook'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { ListDocumentBooksVM, TenantWithNameOnlyVM } from '@/shared/services/api'
import { fetchMoreDocumentBookOptions } from '@/shared/utils/clerical/getDocBookOption'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { uniq } from 'lodash-es'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import z from 'zod'
import ModalListDocumentTypeInBook from '../components/modals/ModalListDocumentTypeInBook.vue'
import { ownBookUnitSchema, registerODNumSchema } from '../schemas/keepNumberSchema'
import { transformUsedNumberDisplay } from '../utils/document'

type TModalDocTypes = InstanceType<typeof ModalListDocumentTypeInBook>
type TProps = {
  chooableHasStampUnits: TenantWithNameOnlyVM[]
  isLoadingUnitData: boolean
}
type TUnitSchema = z.infer<typeof ownBookUnitSchema>

const { chooableHasStampUnits, isLoadingUnitData } = defineProps<TProps>()

const docTypesModalRef = ref<TModalDocTypes | null>(null)

const extendedRegisterODNumSchema = registerODNumSchema.extend({
  registerNumber: registerODNumSchema.shape.registerNumber.superRefine((value, ctx) => {
    const startCount = values?.documentBook?.value?.startCount

    if (!value || Number(value) < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vui lòng nhập số lớn hơn 0'
      })
      return
    }

    const isSingleNumber = /^[0-9]*[.,]?[0-9]+$/.test(value)
    const isRange = /^\d+:\d+$/.test(value)

    if (!isSingleNumber && !isRange) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vui lòng nhập một số hoặc dải số dạng X:Y'
      })
      return
    }

    if (isSingleNumber) {
      const num = Number(value.replace(',', '.'))
      if (startCount && num < startCount) {
        ctx.addIssue({
          code: 'custom',
          message: `Số muốn giữ phải lớn hơn số bắt đầu của sổ: ${startCount}`
        })
      }
      return
    }

    if (isRange) {
      const [start, end] = value.split(':').map(Number)
      if (startCount && start && start < startCount) {
        ctx.addIssue({
          code: 'custom',
          message: `Số bắt đầu phải lớn hơn số bắt đầu của sổ: ${startCount}`
        })
      }
      if (start && end && start >= end) {
        ctx.addIssue({
          code: 'custom',
          message: 'Số kết thúc phải lớn hơn số bắt đầu'
        })
      }
    }
  })
})

const { values, handleReset, handleSubmit, setFieldValue, errors, setFieldError } = useForm({
  validationSchema: toTypedSchema(extendedRegisterODNumSchema),
  initialValues: {}
})

const confirm = useConfirm()
// const queryCliean
const {
  setValue: setOwnBookUnit,
  value: ownBookUnit,
  errorMessage: ownBookUnitErrMsg
} = useField<TUnitSchema>('ownBookUnit')

const queryClient = useQueryClient()

const { mutate: createRegistration, isPending: isCreatingRegistration } = useCreateRegisterNumOD({
  onSuccess: () => {
    toastSucceed({ detail: 'Tạo đăng ký giữ số thành công' })
    queryClient.invalidateQueries({ queryKey: ['getRegisterNumber'] })

    handleReset()
  }
})

const {
  data: detailDocumentBook,
  isLoading: isGettingDetailData,
  isSuccess: isGettingDetailSuccess
} = useGetDetailDocumentBook(() => values?.documentBook?.value?.id!, {
  enabled: () => !!values?.documentBook?.value?.id
})

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

watch([detailDocumentBook, isGettingDetailSuccess], ([detailBook, isSuccess]) => {
  if (isSuccess) {
    setFieldValue(
      'keptNumber',
      transformUsedNumberDisplay(
        uniq([
          ...(detailBook?.usedNumberOrdinals ?? []),
          ...(detailBook?.registeredKeepNumbers ?? [])?.map((keptNum) => keptNum?.number)
        ])?.sort((a, b) => a - b) ?? []
      ),
      false
    )
    setFieldError('registerNumber', undefined)
    setFieldValue('registerNumber', detailBook?.availableCount?.toString(), false)
  } else {
    setFieldValue('keptNumber', undefined, false)
    setFieldError('registerNumber', undefined)
    setFieldValue('registerNumber', undefined, false)
  }
})

// watchEffect(() => {
//   if (isSuccess) {
//     handleReset()
//   }
// })
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

const handleSelectOwnBookUnit = (submitValue: TCommonSelectOptions<string>) => {
  setOwnBookUnit(submitValue)
}

const handleDocumentBookChange = (book: TCommonSelectOptions<ListDocumentBooksVM>) => {
  if (book?.value?.id) {
    docTypesModalRef.value?.openModal(book.value.id)
  }
}

const onSubmit = handleSubmit((values) => {
  confirm.require({
    group: 'registerNumber',
    message: `Thầy/Cô xác nhận tạo đăng ký giữ số?`,
    header: 'Đăng ký giữ số',
    accept: () => {
      const [start, end] = values.registerNumber?.split(':').map(Number)
      createRegistration(
        cleanObject({
          documentBookId: values?.documentBook?.value?.id,
          startKeepNumber: start,
          endKeepNumber: end,
          reason: values?.reason,
          title: values?.title
        })
      )
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    }
  })
})
</script>

<template>
  <div class="card">
    <form @submit="onSubmit">
      <div class="grid grid-cols-4 gap-4">
        <AppSelect
          label="Đơn vị giữ sổ"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="ownBookUnit"
          :disabled="isLoadingUnitData"
          searchable
          class="col-span-2 lg:col-span-1"
          :fetch-options="fetchUnitsByPermission"
          @select="handleSelectOwnBookUnit"
        ></AppSelect>

        <AppSelect
          class="col-span-2 lg:col-span-1"
          label="Sổ văn bản"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="documentBook"
          searchable
          :multiple="false"
          :disabled="!ownBookUnit?.value"
          :fetch-options="handleGenBookOpts"
          @change="handleDocumentBookChange"
          :cacheUniqs="[ownBookUnit?.value || '']"
        />
        <AppTextInput
          class="col-span-2 lg:col-span-1"
          name="registerNumber"
          label="Số muốn giữ"
          :disabled="!values?.documentBook || isGettingDetailData"
          required
          hint-content="Nhập một chữ số (hoặc nhập X:Y nếu đăng ký một dải số từ X đến Y)"
          placeholder="Nhập số muốn giữ"
        />
        <AppTextInput
          class="col-span-2 lg:col-span-1"
          name="keptNumber"
          label="Các số đã sử dụng trong sổ"
          disabled
        />
      </div>
      <div class="mt-4 grid grid-cols-2 gap-4">
        <AppTextarea required name="reason" label="Lý do" placeholder="Nhập lý do.." />
        <AppTextarea
          name="title"
          label="Tiêu đề"
          placeholder="Nhập tiêu đề của việc đăng ký giữ số..."
        />
      </div>
      <div class="mt-6 flex justify-end">
        <Button
          type="submit"
          @click="console.log(errors, 'errorserrorserrors')"
          label="Đăng ký"
          :loading="isCreatingRegistration"
        />
      </div>
    </form>
    <ModalListDocumentTypeInBook ref="docTypesModalRef" />
    <ConfirmDialog group="registerNumber" />
  </div>
</template>
