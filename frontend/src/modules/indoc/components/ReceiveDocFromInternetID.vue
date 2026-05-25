<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onUnmounted, ref, watch } from 'vue'

import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import {
  checkMatchEnv,
  cleanObject,
  downLoadDocumentFileViaUrl,
  getFileName,
  getFullFileUrl,
  isExist
} from '@/shared/utils/common'

import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import { useGetDetailDocumentBook } from '@/shared/composables/queries/clerical/useGetDetailDocumentBook'
import { DOCUMENT_TYPES } from '@/shared/constants/document'
import type {
  DetailInDocumentVM,
  ListDocumentBooksVM,
  RegisterInDocRequestPriorityEnum
} from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { isDoc, isImage, isPdf } from '@/shared/utils/check'
import { getUrgencyLevelOptions, getUrgencyLevelSelectData } from '@/shared/utils/document'
import { DateTime } from 'luxon'
import { RadioButton, RadioButtonGroup, useToast } from 'primevue'
import { computed } from 'vue'
import { useAddInternalIDIntoBook } from '../composables/queries/useAddInternalIDIntoBook'
import { addInternetDocument } from '../schemas/common'

type TProps = {
  documentDetail: DetailInDocumentVM
  selectTab: 'inputInternalDoc' | 'updateInternalDoc'
  isEDocUpdate?: boolean
}

type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

const { documentDetail, selectTab, isEDocUpdate } = defineProps<TProps>()

const addDocBookFormTypeValidations = toTypedSchema(
  addInternetDocument.superRefine((data, ctx) => {
    const availableCount = data?.documentBook?.value?.availableCount
    if (data?.inOrdinal < availableCount) {
      ctx.addIssue({
        code: 'custom',
        message: `Số đến phải lớn hơn ${availableCount}`,
        path: ['inOrdinal']
      })
    }
  })
)

const emit = defineEmits<{
  success: []
  mainFileSelected: [filePath: string]
}>()

const { defineField, handleSubmit, setFieldValue, setValues, resetForm, errors, values } = useForm({
  validationSchema: addDocBookFormTypeValidations,
  initialValues: {
    description: ''
  }
})

const {
  data: detailDocumentBook,
  isLoading: isGettingDetailBook
  // isSuccess: isGetDetailBoolSuccess
} = useGetDetailDocumentBook(() => values.documentBook?.value?.id!, {
  enabled: () => !!values.documentBook?.value?.id
})

const isEDoc = computed(() => documentDetail?.sourceInfo?.type === 'EXTERNAL')
const previewModalRef = ref<TPreviewModalRef | null>(null)

const toast = useToast()
const { mutate: addInternalIdIntoBook, isPending: isAddingInternalID } = useAddInternalIDIntoBook({
  onSuccess: () => {
    toast.add({
      severity: 'success',
      life: 3000,
      summary: 'Tiếp nhận văn bản đến thành công'
    })
    emit('success')
  }
})

const [mainFilePath] = defineField('mainFilePath')
const selectedBook = computed(() => values?.documentBook?.value)

const handleFetchDocumentBookList = async (search: string, page: number) => {
  const result = await sharedDocumentBookService.getBooks(
    cleanObject({
      page,
      size: 20,
      sort: [],
      search
    }),
    {
      unitId: documentDetail?.unitId,
      status: 'OPEN',
      bookTypes: [DOCUMENT_TYPES.inDoc]
    }
  )
  return {
    options: result?.docs?.map((book) => ({
      label: book.name,
      value: book
    })) as TCommonSelectOptions<ListDocumentBooksVM>[],
    hasMore: page < result?.pageCount
  }
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

const onSubmit = handleSubmit((formData) => {
  const convertFormData = cleanObject({
    documentBookId: formData.documentBook.value.id,
    documentType: formData.documentType.value?.id ?? '',
    issuer: formData?.issuer,
    inOrdinal: formData.inOrdinal,
    arrivalDate: DateTime.fromJSDate(formData.arrivalDate).toISODate() ?? '',
    priority: formData?.priority?.value as RegisterInDocRequestPriorityEnum,
    subject: formData.shortDescription,
    signerInfo:
      formData.signerName || formData.signerPosition
        ? cleanObject({
            name: formData.signerName,
            position: formData.signerPosition
          })
        : undefined,
    issuedDate: formData?.issuedDate
      ? DateTime.fromJSDate(formData?.issuedDate).toISODate()!
      : undefined,
    dueDate: formData?.dueDate ? DateTime.fromJSDate(formData?.dueDate).toISODate()! : undefined,
    description: formData.description,
    mainFilePath: formData.mainFilePath,
    annexesPath: formData.annexesPath
  })
  addInternalIdIntoBook({
    id: documentDetail.documentId,
    body: convertFormData
  })
  // mutate(convertFormData)
  console.log('🚀 ~ onSubmit ~ formData:', formData)
})
const urgencyLevels = getUrgencyLevelOptions()
defineExpose({
  onSubmit,
  isAddingInternalID
})

onUnmounted(() => resetForm())

watch(
  () => documentDetail,
  (newData) => {
    if (newData)
      setValues(
        {
          documentBook: undefined,
          documentCode: newData?.documentCode,
          shortDescription: newData?.subject,
          priority: urgencyLevels.find((priority) => priority.value === newData?.priority),
          signerName: newData?.signerName,
          signerPosition: newData?.signerPosition,
          arrivalDate: new Date(newData?.arrivalDate),
          issuedDate: newData?.issuedDate ? new Date(newData?.issuedDate) : null,
          dueDate: newData?.dueDate ? new Date(newData?.dueDate) : null,
          inOrdinal: newData?.inOrdinal,
          issuer: newData?.issuedUnit,
          description: newData?.description,
          mainFilePath: newData.mainFile,
          annexesPath: newData.annexes
        },
        false
      )
  },
  { immediate: true }
)
</script>
<template>
  <div>
    <form @submit="onSubmit">
      <div class="grid gap-3 px-4 py-2">
        <div class="grid grid-cols-2 gap-3">
          <AppSelect
            name="documentBook"
            v-if="!isEDocUpdate"
            :fetch-options="handleFetchDocumentBookList"
            label="Sổ văn bản"
            placeholder="Chọn sổ văn bản"
            :searchable="true"
            :multiple="false"
            :required="!isEDocUpdate"
            @select="
              (documentBook) => {
                setFieldValue('documentType', undefined, false)
                setFieldValue('inOrdinal', documentBook?.value?.availableCount)
              }
            "
            :error-message="errors.documentBook"
          />
          <AppSelect
            name="documentType"
            v-if="!isEDocUpdate"
            :fetch-options="fetchMoreDocumentTypeOptions"
            :cache-uniqs="values?.documentBook?.value?.id ? [values?.documentBook?.value?.id] : []"
            :disabled="!selectedBook?.id"
            :required="!isEDocUpdate"
            label="Loại văn bản"
            placeholder="Chọn loại văn bản"
            :searchable="true"
            :error-message="errors.documentType"
          />
          <AppNumberInput
            v-if="!isEDocUpdate"
            name="inOrdinal"
            label="Số đến"
            :required="!isEDocUpdate"
            placeholder="Nhập số đến"
            :disabled="!values?.documentBook"
            :error-message="errors.inOrdinal"
          />
          <AppDateInput
            name="arrivalDate"
            label="Ngày đến"
            placeholder="Chọn ngày"
            :date-format="'dd/mm/yy'"
            required
            :disabled="isEDocUpdate"
            :error-message="errors.arrivalDate"
          />
          <AppTextInput
            v-if="!isEDocUpdate"
            name="documentCode"
            label="Số ký hiệu"
            :required="!isEDocUpdate"
            disabled
            placeholder="Số ký hiệu"
          />
          <AppDateInput
            :disabled="isEDocUpdate"
            name="issuedDate"
            label="Ngày ban hành"
            placeholder="Chọn ngày"
            :date-format="'dd/mm/yy'"
          />
          <AppSelect
            name="priority"
            :fetch-options="getUrgencyLevelSelectData"
            label="Độ khẩn"
            placeholder="Độ khẩn"
            required
          />
          <AppDateInput
            name="dueDate"
            label="Hạn trả lời"
            placeholder="Chọn ngày"
            :date-format="'dd/mm/yy'"
          />
        </div>
        <AppTextInput
          name="issuer"
          :label-class="'inline-block mb-1'"
          label="Cơ quan ban hành"
          placeholder="Cơ quan ban hành"
          required
          :disabled="!checkMatchEnv(['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'])"
        />
        <AppTextarea
          name="shortDescription"
          label="Trích yếu nội dung"
          :label-class="'inline-block mb-1'"
          placeholder="Nhập trích yếu nội dung"
          required
          :limit-number="250"
          :error-message="errors.shortDescription"
        />
        <AppTextarea
          name="description"
          label="Ghi chú"
          :label-class="'inline-block mb-1'"
          placeholder="Nhập nội dung ghi chú (nếu có)"
          :limit-number="250"
        />
        <div class="grid grid-cols-2 gap-3">
          <AppTextInput
            name="signerName"
            :label-class="'inline-block mb-1'"
            label="Tên người ký"
            placeholder="Nhập tên người ký"
          />
          <AppTextInput
            name="signerPosition"
            :label-class="'inline-block mb-1'"
            label="Vị trị người ký"
            placeholder="Nhập vị trị người ký"
          />
        </div>
        <div class="grid grid-cols-2 gap-3" v-if="!isEDoc">
          <div class="mb-1 flex w-full flex-col">
            <div class="text-primary font-semibold">File văn bản</div>
            <div class="mt-1 flex items-center" v-if="isExist(documentDetail?.mainFile)">
              <div class="flex h-5 w-5 items-center">
                <span class="icon-[hugeicons--file-attachment] text-primary-300 text-xl"></span>
              </div>
              <div class="overflow mx-1 line-clamp-1 overflow-hidden">
                {{ getFileName(documentDetail?.mainFile) }}
              </div>
              <span
                class="icon-[bxs--download] text-primary-300 text-xl hover:cursor-pointer"
                @click="
                  () => {
                    downLoadDocumentFileViaUrl(
                      getFullFileUrl(documentDetail.mainFile),
                      getFileName(documentDetail.mainFile)
                    )
                  }
                "
              >
              </span>
            </div>
          </div>

          <div class="mb-1 flex w-full flex-col">
            <div class="text-primary font-semibold">File phụ lục</div>
            <template v-if="isExist(documentDetail?.annexes) && documentDetail?.annexes?.length">
              <div
                class="mt-1 flex items-center"
                v-for="(file, fileIdx) in documentDetail?.annexes"
                :key="fileIdx"
              >
                <div class="flex h-5 w-5 items-center">
                  <span class="icon-[hugeicons--file-attachment] text-primary-300 text-xl"></span>
                </div>
                <div class="overflow mx-1 line-clamp-1 overflow-hidden text-ellipsis">
                  {{ getFileName(file) }}
                </div>
                <span
                  class="icon-[bxs--download] text-primary-300 text-xl hover:cursor-pointer"
                  @click="
                    () => {
                      downLoadDocumentFileViaUrl(getFullFileUrl(file), getFileName(file))
                    }
                  "
                >
                </span>
              </div>
            </template>
          </div>
        </div>
        <div class="w-full" v-if="isEDoc && selectTab === 'inputInternalDoc'">
          <div class="mb-1 flex w-full flex-col">
            <div class="text-primary font-semibold">Chọn file văn bản</div>
            <RadioButtonGroup
              value="'mainFilePath'"
              v-model="mainFilePath"
              class="mt-2 flex flex-col rounded bg-white p-2"
              :default-value="documentDetail.mainFile"
              @value-change="(filePath) => emit('mainFileSelected', filePath)"
            >
              <div
                v-for="(file, fileIdx) in [
                  documentDetail?.mainFile,
                  ...(documentDetail.annexes ?? [])
                ]"
                :key="fileIdx"
                :class="[
                  'bg-surface-100 grid grid-cols-6 items-center gap-4 rounded px-2 py-3',
                  fileIdx > 0 ? 'mt-2' : ''
                ]"
              >
                <label
                  :for="file"
                  class="col-start-1 col-end-6 line-clamp-1 font-semibold text-ellipsis"
                >
                  {{ getFileName(file) }}
                </label>
                <div class="flex items-center justify-center gap-2">
                  <span
                    class="icon-[uil--file-download-alt] text-primary flex cursor-pointer justify-end text-2xl"
                    @click="downLoadDocumentFileViaUrl(getFullFileUrl(file), getFileName(file))"
                  ></span>
                  <span
                    class="icon-[mingcute--eye-2-line] text-2xl"
                    :class="
                      !file || !(isPdf(file) || isDoc(file) || isImage(file))
                        ? 'pointer-events-none text-gray-300'
                        : 'text-primary cursor-pointer'
                    "
                    @click="previewModalRef?.openModal(file)"
                  ></span>
                  <RadioButton
                    :input-id="file"
                    :value="file"
                    size="small"
                    name="mainFilePath"
                    :disabled="!['.pdf', '.docx'].some((ext) => file?.endsWith(ext))"
                  />
                </div>
              </div>
            </RadioButtonGroup>
          </div>
        </div>
        <div v-if="isEDoc && selectTab === 'updateInternalDoc'">
          <div class="mb-1 flex w-full flex-col">
            <div class="text-primary font-semibold">Xem thông tin văn bản cũ</div>
          </div>
        </div>
      </div>
    </form>
    <ModalPreviewFile ref="previewModalRef" />
  </div>
</template>
