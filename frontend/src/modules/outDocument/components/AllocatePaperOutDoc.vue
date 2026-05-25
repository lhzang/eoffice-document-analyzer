<script setup lang="ts">
import { DOCUMENT_BOOK_TYPES_VALUES } from '@/modules/clerical/constants/documentBook'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import ModalWaitAcceptSign from '@/shared/components/modals/ModalWaitAcceptSign.vue'
import OutDocAllocateDestinationInfo from '@/shared/components/outDoc/OutDocAllocateDestinationInfo.vue'
import { useGetDetailDocumentBook } from '@/shared/composables/queries/clerical/useGetDetailDocumentBook'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { PDF_FILE_TYPE, RECEIVER_SYSTEM_TYPES } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type {
  DetailDocumentVM,
  DocumentTypeVM,
  ListDocumentBooksVM,
  SigningConfigVM
} from '@/shared/services/api/index.ts'
import { fetchMoreDocumentBookOptions } from '@/shared/utils/clerical/getDocBookOption'
import { checkMatchEnv, toastSucceed } from '@/shared/utils/common'
import { transformDocDestinationsIntoTreeInput } from '@/shared/utils/outDoc/destination'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Checkbox, ConfirmDialog, Divider, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watch, watchEffect } from 'vue'
import { useIssuePaperOutDoc } from '../composables/queries/useIssuePaperOutDoc.ts'
import { allocatePaperOutDocSchema } from '../schemas/documentSchema'
import ModalSelectRegisteredNum from './modals/ModalSelectRegisteredNum.vue'
import SelectDestination from './SelectDestination.vue'

type TProps = {
  detailDocument: DetailDocumentVM
}
type TModalWaitAcceptSign = InstanceType<typeof ModalWaitAcceptSign>
type TModalSelectRegisteredNum = InstanceType<typeof ModalSelectRegisteredNum>

const emit = defineEmits<{
  (e: 'issuedDoc'): void
  (e: 'updateMainFile', file: File | null): void
}>()

const confirm = useConfirm()

const { detailDocument } = defineProps<TProps>()

const selectedProvider = ref<SigningConfigVM | null>(null)
const modalSelectRegisteredNum = ref<TModalSelectRegisteredNum | null>(null)
const modalWaitAcceptSign = ref<TModalWaitAcceptSign | null>(null)
const outOrdinalIcon = ref<HTMLDivElement | null>(null)
const prefixWidth = ref(50)

const { mutate: issuePaperOutDoc } = useIssuePaperOutDoc({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cấp số văn bản thành công'
    })
    emit('issuedDoc')
  },
  onSettled: () => {
    modalWaitAcceptSign?.value?.closeModal()
  }
})

const schema = allocatePaperOutDocSchema.extend({
  outOrdinal: allocatePaperOutDocSchema.shape.outOrdinal.superRefine((value, ctx) => {
    const startCount = values?.documentBook?.value?.startCount ?? 0
    const raw = values?.outOrdinal

    const parseOutOrdinal = (val: unknown): { value: number | null; error?: string } => {
      if (val == null || String(val).trim() === '') {
        return { value: null, error: 'Không được để trống' }
      }
      const str = String(val).trim()
      // format: number + optional max 2 letters
      const match = str.match(/^(\d+)([\p{L}]{0,2})$/u)
      if (!match) {
        return {
          value: null,
          error:
            'Sai định dạng. Chỉ cho phép số + tối đa 2 chữ cái phía sau (ví dụ: 123 hoặc 123AB)'
        }
      }
      const numStr = match[1]
      // leading zero not allowed (except "0")
      if (numStr && numStr?.length > 1 && numStr?.startsWith('0')) {
        return {
          value: null,
          error: 'Không được bắt đầu bằng số 0'
        }
      }
      const num = Number(numStr)
      if (num < startCount) {
        return {
          value: null,
          error: `Phải lớn hơn hoặc bằng số bắt đầu của sổ: ${startCount}`
        }
      }
      return { value: num }
    }
    const { error } = parseOutOrdinal(raw)
    if (error) {
      ctx.addIssue({
        code: 'custom',
        path: ['outOrdinal'],
        message: error
      })
      return
    }
  })
})

const { handleSubmit, values, setFieldValue, setFieldError, errors } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    createdDate: new Date(detailDocument?.createdAt),
    // documentCode:   `/${detailDocument?.outDocType}-${}`
    subject: detailDocument?.subject,
    description: detailDocument?.description ?? undefined,
    issueDate: new Date(),
    destinations: [
      ...(transformDocDestinationsIntoTreeInput(detailDocument?.destinations)?.values() ?? [])
    ],
    majorSigner: detailDocument?.majorSignerLeader?.name,
    isSendImmediately: checkMatchEnv(['development', 'hust_staging', 'prod_hust']) ? true : false
  }
})
const { value: isSendImmediately } = useField('isSendImmediately')

const {
  data: detailDocumentBook,
  isLoading: isGettingDetailBook
  // isSuccess: isGetDetailBoolSuccess
} = useGetDetailDocumentBook(() => values.documentBook?.value?.id!, {
  enabled: () => !!values.documentBook?.value?.id
})

const handleRegisteredNumberSelect = (number: number) => {
  setFieldValue('outOrdinal', number.toString(), true)
}

// watch(
//   [detailDocumentBook, isGetDetailBoolSuccess],
//   ([detailDocumentBook, isGetDetailBoolSuccess]) => {
//     if (detailDocumentBook && isGetDetailBoolSuccess) {
//       const matchType = detailDocumentBook?.documentTypeVMList?.find(
//         (type) => type?.id === detailDocument?.documentTypeId
//       )
//       setFieldValue(
//         'documentType',
//         matchType
//           ? {
//               label: matchType?.name,
//               value: matchType?.id
//             }
//           : undefined,
//         false
//       )
//     }
//   }
// )

const handleGenBookOpts = (search: string, page: number) => {
  return fetchMoreDocumentBookOptions(
    search,
    page,
    detailDocument?.issueUnit?.id,
    [DOCUMENT_BOOK_TYPES_VALUES.outDoc],
    DOCUMENT_BOOK_STATUS.OPEN,
    detailDocument?.haveNumber ? 'num' : 'noNum'
  )
}

const handleSelectDocumentType = (selectOpt: TCommonSelectOptions<DocumentTypeVM>) => {
  setFieldValue(
    'documentCode',
    selectOpt?.value?.name === 'Công văn'
      ? `${detailDocument?.issueUnit?.shortName ?? ''}`
      : `${selectOpt?.value?.shortName ?? ''}-${detailDocument?.issueUnit?.shortName ?? ''}`
  )
}

const fetchMoreDocumentTypeOptions = async (search: string) => {
  const filteredType = (detailDocumentBook?.value?.documentTypeVMList ?? [])?.filter((type) =>
    type?.name?.toLowerCase()?.includes(search?.toLowerCase())
  )

  return {
    options: filteredType.map((doc) => ({ value: doc, label: doc.name })),
    hasMore: false
  }
}

const handleSelectDocumentBook = (selectOpt: TCommonSelectOptions<ListDocumentBooksVM>) => {
  setFieldError('outOrdinal', undefined)
  setFieldValue('outOrdinal', selectOpt?.value?.availableCount.toString(), true)
  setFieldValue(
    'documentCode',
    `${selectOpt?.value?.shortName ?? ''}-${detailDocument?.issueUnit?.shortName ?? ''}`
  )
  modalSelectRegisteredNum?.value?.startCheck(selectOpt?.value?.id)
}

const handleTriggerSubmitAllocate = (provider: SigningConfigVM) => {
  selectedProvider.value = provider
  handleSubmit(
    () => {
      confirm.require({
        group: 'confirmAllocatePaperDoc',
        message: 'Thầy/Cô có xác nhận cấp số văn bản đi ký giấy?',
        header: 'Cấp số',
        rejectProps: {
          label: 'Hủy',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Xác nhận',
          severity: 'primary'
        },
        accept: () => {
          handleIssueOutDoc()
        }
      })
    },
    (invalid) => {
      console.log(invalid.errors)
    }
  )()
}

const handleIssueOutDoc = () => {
  if (selectedProvider?.value) modalWaitAcceptSign?.value?.openModal(selectedProvider?.value)
  issuePaperOutDoc({
    documentId: detailDocument?.id,
    issuedPaperOutDocRequest: {
      documentBookId: values?.documentBook?.value?.id!,
      documentType: values?.documentType?.value?.id!,
      documentTypeId: values?.documentType?.value?.id!,
      signingProvider: selectedProvider?.value?.signingProvider!,
      outOrdinal: values?.outOrdinal?.toString()!,
      notation: values?.documentCode!,
      issueDate: DateTime.fromJSDate(values?.issueDate!).toISODate()!,

      destinationDtos: (values?.destinations ?? [])?.map((destination) => ({
        type: destination?.type,
        systemType: destination?.systemType,
        role: destination?.formName,
        destinationId: destination?.id
      })),
      sendImmediately: !!values?.isSendImmediately,
      subject: values?.subject!
    },
    mainFile: values.mainFile! as File,
    annexes: values?.annexesFiles ?? []
  })
}

const handleSelectMainFile = (file: File | null) => {
  // if (!file) return
  // if (file?.type === PDF_FILE_TYPE || DOCX_FILE_TYPE) {
  emit('updateMainFile', file)
  // }
}

defineExpose({
  triggerSubmit: handleTriggerSubmitAllocate
})

watchEffect(() => {
  if (detailDocumentBook?.value) {
    const matchedType = (detailDocumentBook?.value?.documentTypeVMList ?? [])?.find(
      (type) => type?.id === detailDocument?.documentType
    )
    if (matchedType) setFieldValue('documentType', matchedType, false)
  }
})

watch(
  () => values.documentBook,
  (documentBook) => {
    if (documentBook)
      setFieldValue(
        'documentCode',
        `${values?.documentType?.value?.shortName ?? ''}-${detailDocument?.issueUnit?.shortName ?? ''}`,
        false
      )
  }
)

watch(
  [outOrdinalIcon, () => values?.outOrdinal],
  ([outOrdinalIcon]) => {
    if (outOrdinalIcon) {
      const width = outOrdinalIcon.offsetWidth
      prefixWidth.value = width
    }
  },
  { flush: 'post' }
)
</script>
<template>
  <div class="px-4 py-2">
    <form>
      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          label="Sổ văn bản"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="documentBook"
          searchable
          :fetch-options="handleGenBookOpts"
          :multiple="false"
          @select="handleSelectDocumentBook"
        ></AppSelect>
        <AppSelect
          name="documentType"
          :fetch-options="fetchMoreDocumentTypeOptions"
          :disabled="!values?.documentBook || isGettingDetailBook"
          :multiple="false"
          required
          :cache-uniqs="detailDocumentBook?.id ? [detailDocumentBook?.id] : []"
          @select="handleSelectDocumentType"
          label="Loại văn bản"
          :model-value="values?.documentType"
          :placeholder="MSG_PLEASE_SELECT"
          :searchable="true"
          :append-to-body="true"
        />
        <AppTextInput
          name="outOrdinal"
          label="Số văn bản"
          :disabled="!values?.documentBook"
          placeholder="Số văn bản"
          required
          hint-content="Số văn bản không thể trùng"
        ></AppTextInput>
        <!-- <AppNumberInput
          name="outOrdinal"
          label="Số văn bản"
          :disabled="!values?.documentBook"
          placeholder="Số văn bản"
          required
          hint-content="Số văn bản không thể trùng"
        ></AppNumberInput> -->
        <AppTextInput
          name="documentCode"
          label="Số và ký hiệu văn bản"
          :disabled="!values?.documentBook"
          required
          hint-content="Nội dung toàn bộ của dòng Số: trong văn bản"
          placeholder="Vui lòng nhập số ký hiệu..."
          iconClass="mt-0! -translate-y-1/2! flex! items-center"
          :inputPt="{
            root: {
              class: '!text-red-500'
            }
          }"
          :inputStyle="{ paddingLeft: `calc(${prefixWidth}px + 12px)`, color: '' }"
        >
          <template #prefixIcon>
            <div ref="outOrdinalIcon">{{ values?.outOrdinal ?? 'XX' }}/</div>
          </template>
        </AppTextInput>
        <AppDateInput
          name="createdDate"
          label="Ngày tạo văn bản"
          disabled
          placeholder="Chọn ngày"
          :append-to="'body'"
          :date-format="'dd/mm/yy'"
          auto-z-index
        ></AppDateInput>
        <AppDateInput
          name="issueDate"
          label="Ngày ban hành"
          :clearable="false"
          required
          :append-to="'body'"
          :date-format="'dd/mm/yy'"
          auto-z-index
        ></AppDateInput>
        <AppTextarea
          name="subject"
          label="Trích yếu nội dung"
          required
          :limit-number="250"
          placeholder="Nhập trích yếu nội dung..."
          class="col-span-2"
        />
        <AppTextarea
          name="description"
          placeholder="Nhập ghi chú..."
          label="Ghi chú của người tạo văn bản"
          :limit-number="250"
          disabled
          class="col-span-2"
        />
        <AppTextInput name="majorSigner" label="Lãnh đạo ban hành" disabled class="col-span-2" />
        <AppFileInput
          class="col-span-2"
          name="mainFile"
          :accept="`${PDF_FILE_TYPE}`"
          label="File văn bản"
          required
          :multiple="false"
          @change="handleSelectMainFile"
        />
        <AppFileInput
          class="col-span-2"
          name="annexesFiles"
          label="File phụ lục đính kèm"
          :multiple="true"
        />
        <SelectDestination
          :unit-id="detailDocument?.issueUnit?.id"
          :default-value="transformDocDestinationsIntoTreeInput(detailDocument?.destinations)"
          @submit="(destinations) => setFieldValue('destinations', [...destinations?.values()])"
        >
          <template #triggerElement="{ onClick, selectedDestinations }">
            <div class="col-span-2">
              <div class="flex items-center justify-between gap-2">
                <label class="text-primary font-semibold">Nơi nhận</label>
                <span class="text-primary cursor-pointer font-semibold underline" @click="onClick"
                  >Sửa</span
                >
              </div>
              <div class="border-primary mt-4 min-h-40 rounded-sm border">
                <div v-if="selectedDestinations?.size">
                  <div
                    v-if="
                      [...(selectedDestinations?.values() ?? [])]?.filter(
                        (destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES.internal
                      )?.length
                    "
                    class="flex items-start justify-between gap-4 p-4"
                  >
                    <span class="text-primary font-semibold">Trong tổ chức</span>
                    <OutDocAllocateDestinationInfo
                      :destinationList="[...(selectedDestinations.values() ?? [])]"
                      :type="'internal'"
                    />
                  </div>
                  <Divider class="m-0! p-0!" />
                  <div
                    v-if="
                      [...(selectedDestinations?.values() ?? [])]?.filter(
                        (destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES.external
                      )?.length
                    "
                    class="flex items-start justify-between gap-4 p-4"
                  >
                    <span class="text-primary font-semibold">Ngoài tổ chức</span>
                    <OutDocAllocateDestinationInfo
                      :destinationList="[...(selectedDestinations.values() ?? [])]"
                      :type="'external'"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="text-primary flex h-40 w-full items-center justify-center font-semibold"
                >
                  Chưa có nơi nhận
                </div>
              </div>
            </div>
          </template>
        </SelectDestination>
        <div class="flex items-center gap-2 font-semibold">
          <Checkbox v-model="isSendImmediately" name="isSendImmediately" :binary="true" />
          <label>Xác nhận gửi đơn vị</label>
        </div>
      </div>
    </form>
    <!-- <ModalPreviewIssueDoc
      v-if="detailDocument && values?.outOrdinal && values?.documentCode && values?.issueDate"
      ref="previewModalDoc"
      :fileName="detailDocument?.documentFiles?.mainFile?.split('/')?.[0] ?? 'file_van_ban.pdf'"
      :documentId="detailDocument?.id"
      :destinations="values?.destinations ?? []"
      :outOrdinal="values?.outOrdinal"
      :documentCode="values?.documentCode"
      :issueDate="DateTime.fromJSDate(values?.issueDate).toISODate()"
      @confirmRegister="handleIssueOutDoc"
    /> -->
    <ModalWaitAcceptSign ref="modalWaitAcceptSign" />
    <ModalSelectRegisteredNum
      ref="modalSelectRegisteredNum"
      @numberSelect="handleRegisteredNumberSelect"
    />
    <ConfirmDialog group="confirmAllocatePaperDoc" />
  </div>
</template>
