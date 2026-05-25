<script lang="ts" setup>
import PublishUnitSelect from '@/modules/organization/components/PublishUnitSelect.vue'
import PdfViewer from '@/shared/components/PdfViewer.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useConvertDocxIntoPdf } from '@/shared/composables/queries/common/useConvertDocxIntoPdf'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import {
  DOCX_FILE_TYPE,
  PDF_FILE_TYPE,
  URGENCY_LEVEL_LABELS,
  UrgentLevelsEnum
} from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { type ListDocumentBooksVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { fetchMoreDocumentBookOptions } from '@/shared/utils/clerical/getDocBookOption'
import { toastError, toastSucceed } from '@/shared/utils/common'
import { getPriorityOptions } from '@/shared/utils/document'
import AppDateInput from '@form-element/AppDateInput.vue'
import AppFileInput from '@form-element/AppFileInput.vue'
import AppSelect, { type TCommonSelectOptions } from '@form-element/AppSelect.vue'
import AppTextarea from '@form-element/AppTextarea.vue'
import AppTextInput from '@form-element/AppTextInput.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useDropZone } from '@vueuse/core'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, RadioButton, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAddPaperID } from '../composables/queries/useAddPaperID'
import type { TCreateIncomingPaperFormData } from '../models/inDocTypes'
import { createPaperIDSchema } from '../schemas/documentSchemas'

const schema = toTypedSchema(createPaperIDSchema)

const { handleSubmit, values, errors, setFieldValue, handleReset } = useForm({
  validationSchema: schema,
  initialValues: {
    signAttachment: false,
    signAppendix: false,
    priorityLevel: {
      label: URGENCY_LEVEL_LABELS?.NORMAL,
      value: UrgentLevelsEnum?.Normal
    },
    inDate: DateTime.now().toJSDate()
  }
})

const convertedFile = ref<File | null>(null)

const { value: signAttachment } = useField('signAttachment')
const { value: signAppendix } = useField('signAppendix')
const { setValue: setIssueUnit } = useField('issueUnit')

const confirm = useConfirm()

const dropZoneRef = ref<HTMLDivElement>()

const profileStore = useUserProfileStore()
const router = useRouter()

const { mutate: addPaperID, isPending: isAddingPaperID } = useAddPaperID({
  onSuccess: () => {
    toastSucceed({ summary: 'Tạo văn bản thành công' })
    router.push(ROUTE_PATHS.incomingDoc.inDocCreated)
  }
})

const { mutateAsync: convertFile, isPending: isConvertingFile } = useConvertDocxIntoPdf({})

const handleConvertFile = async (file: File) => {
  convertedFile.value = (await convertFile({ file: file })) ?? null
}

const handleImportDocument = (files: File[] | null) => {
  convertedFile.value = null
  const dropFile = files?.[0]
  if (!dropFile) {
    setFieldValue('attachmentFile', null!)
    setFieldValue('signAttachment', false)
    return
  }
  if (dropFile?.type === PDF_FILE_TYPE) {
    setFieldValue('attachmentFile', dropFile)
  } else {
    handleConvertFile(dropFile)
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleImportDocument,
  // specify the types of data to be received.
  dataTypes: [DOCX_FILE_TYPE, PDF_FILE_TYPE],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
})

const { data: unitsByPermission, isSuccess: isGetAffectTennantsSuccess } =
  useGetAffectUnitBySelfPermission(APP_PERMISSION_VALUES.createPaperIndoc)

// Set default value cho affectedTenant từ đơn vị hiện tại của user
watchEffect(() => {
  if (isGetAffectTennantsSuccess.value) {
    const options = unitsByPermission?.value ?? []
    const currentUnitId = profileStore.user?.currentPosition?.unitId
    const currentUnitName = profileStore.user?.currentPosition?.unitName

    if (currentUnitId && options.length > 0) {
      const currentUnit = options.find((unit) => unit.id === currentUnitId)
      if (currentUnit) {
        setFieldValue('affectedTenant', {
          value: currentUnitId,
          label: currentUnitName
        })
      } else
        setFieldValue('affectedTenant', {
          label: options?.[0]?.name,
          value: options?.[0]?.id
        })
    }
  }
})

const fetchUnitsByPermission = async () => {
  return {
    options:
      unitsByPermission?.value?.map((unit) => ({
        label: unit?.name,
        value: unit?.id
      })) ?? [],
    hasMore: false
  }
}

const handleGenBookOpts = (search: string, page: number) => {
  if (values?.affectedTenant?.value) {
    return fetchMoreDocumentBookOptions(
      search,
      page,
      values.affectedTenant?.value,
      ['INCOMING_DOCUMENT'],
      DOCUMENT_BOOK_STATUS.OPEN
    )
  } else
    return {
      options: [],
      hasMore: false
    }
}

const handleSetDefaultInOrdinal = (selectedBook: TCommonSelectOptions<ListDocumentBooksVM>) => {
  const availableNum = selectedBook?.value?.availableCount
  setFieldValue('inOrdinal', availableNum?.toString())
}

const handleChangeAttachmentFile = (file: File | null) => {
  convertedFile.value = null
  if (!file) {
    setFieldValue('signAttachment', false)
    return
  }
  if (file?.type === PDF_FILE_TYPE) {
    setFieldValue('attachmentFile', file)
  } else {
    handleConvertFile(file)
  }
}

const handleChangeAppendixFiles = (files: File[] | null) => {
  if (!files?.length) setFieldValue('signAppendix', false)
}

const submitCreateData = (data: TCreateIncomingPaperFormData) => {
  confirm.require({
    group: 'addDocument',
    message: 'Thầy/Cô có xác nhận nhập văn bản đến giấy?',
    header: 'Xác nhận',
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
      if (data && data?.issueUnit !== null)
        addPaperID({
          ...data,
          issueUnit: data?.issueUnit
        })
    }
  })
}

const onSubmit = handleSubmit(async (formData) => {
  try {
    if (formData?.signAppendix || formData?.signAttachment) {
      const detailUnit = await sharedUnitService.getUnitInfo(formData?.affectedTenant?.value)
      const defaultProvider = detailUnit?.defaultSigningConfig?.signingProvider
      if (!defaultProvider) toastError({ detail: 'Đơn vị tiếp nhận chưa có cấu hình ký mặc định!' })
      else submitCreateData({ ...formData, provider: defaultProvider })
    } else {
      submitCreateData(formData)
    }
  } catch (e) {
    console.log(e)
  }
})
watchEffect(() => {
  console.log(convertedFile?.value, 'sdhjsdfhjksfdhjkhjkdf')
})
// watch(
//   [checkSuccess, () => values.signAttachment],
//   () => {
//     if (values.signAttachment) {
//       signInDocRef.value?.openModal()
//     }
//   },
//   { immediate: true }
// )

//prevent enter from unexpected submit
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
  }
}
</script>
<template>
  <form @submit="onSubmit" @keydown="handleKeyDown">
    <div class="grid grid-cols-2 gap-4">
      <div class="h-[calc(100vh_-_200px)]">
        <!-- conditional render pdfviewer and dropzone -->
        <KeepAlive>
          <component
            :is="values.attachmentFile ? PdfViewer : AppFileInput"
            v-bind="
              values.attachmentFile
                ? {
                    containerClass: 'shadow-[0_2px_10px_rgba(0,0,0,0.25)]',
                    src: convertedFile ?? values.attachmentFile,
                    loading: isConvertingFile
                  }
                : {
                    accept: `${DOCX_FILE_TYPE},${PDF_FILE_TYPE}`,
                    name: 'attachmentFile',
                    onChange: handleChangeAttachmentFile
                  }
            "
          >
            <template v-if="!values.attachmentFile" #trigger-element="{ triggerFunction }">
              <div
                class="hover:border-primary flex h-full w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all"
                :class="{
                  'border-primary': isOverDropZone
                }"
                ref="dropZoneRef"
                @click="triggerFunction"
              >
                <span class="text-primary">Kéo thả hoặc bấm để chọn file văn bản tải lên</span>
              </div>
            </template>
          </component>
        </KeepAlive>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          label="Đơn vị tiếp nhận"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="affectedTenant"
          searchable
          :fetch-options="fetchUnitsByPermission"
        ></AppSelect>
        <AppSelect
          label="Sổ văn bản"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="documentBook"
          searchable
          :cacheUniqs="[values.affectedTenant?.value || '']"
          :fetch-options="handleGenBookOpts"
          :multiple="false"
          @change="handleSetDefaultInOrdinal"
        ></AppSelect>
        <AppSelect
          label="Loại văn bản"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="documentType"
          :multiple="false"
          :fetch-options="fetchMoreDocumentTypeOptions"
        ></AppSelect>
        <AppTextInput
          name="inOrdinal"
          label="Số đến"
          required
          :placeholder="'Vui lòng chọn sổ văn bản'"
        ></AppTextInput>
        <AppSelect
          label="Độ khẩn"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="priorityLevel"
          :searchable="false"
          :fetch-options="getPriorityOptions"
        ></AppSelect>
        <AppTextInput
          name="documentCode"
          label="Số và ký hiệu văn bản"
          required
          placeholder="Nhập số ký hiệu"
        ></AppTextInput>
        <AppDateInput
          name="inDate"
          label="Ngày đến"
          required
          :date-format="'dd/mm/yy'"
          placeholder="Chọn ngày"
          :max-date="new Date()"
        ></AppDateInput>
        <AppDateInput
          name="dueDate"
          label="Hạn trả lời"
          placeholder="Chọn ngày"
          :min-date="new Date()"
          date-format="dd/mm/yy"
        ></AppDateInput>
        <AppDateInput
          name="issueDate"
          label="Ngày ban hành"
          date-format="dd/mm/yy"
          placeholder="Chọn ngày"
        ></AppDateInput>
        <PublishUnitSelect
          class="col-span-1"
          required
          :error-message="errors.issueUnit"
          @submit="(value) => setIssueUnit(value)"
        />
        <AppTextInput
          class="col-start-1"
          name="signerName"
          label="Tên người ký"
          placeholder="Nhập tên người ký"
        ></AppTextInput>
        <AppTextInput
          name="signerRole"
          label="Vị trí người ký"
          placeholder="Nhập vị trí người ký"
        ></AppTextInput>
        <AppTextarea
          name="description"
          label="Trích yếu nội dung"
          placeholder="Nhập trích yếu nội dung"
          required
        ></AppTextarea>
        <AppTextarea name="note" label="Ghi chú" placeholder="Nhập ghi chú"></AppTextarea>
        <AppFileInput
          label="File văn bản"
          name="attachmentFile"
          required
          :multiple="false"
          @change="handleChangeAttachmentFile"
          :accept="`${DOCX_FILE_TYPE},${PDF_FILE_TYPE}`"
        >
        </AppFileInput>
        <div>
          <label class="text-primary font-semibold">Ký số file văn bản</label>
          <div class="flex h-10 items-center justify-between">
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="signAttachment"
                inputId="dosignAttachment"
                name="signAttachment"
                :value="true"
                :disabled="!values.attachmentFile"
              />
              <label class="font-semibold" for="dosignAttachment">Có</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="signAttachment"
                inputId="notsignAttachment"
                name="signAttachment"
                :value="false"
                :disabled="!values.attachmentFile"
              />
              <label class="font-semibold" for="notsignAttachment">Không</label>
            </div>
          </div>
        </div>
        <AppFileInput
          label="File phụ lục"
          name="appendixFiles"
          :multiple="true"
          @change="handleChangeAppendixFiles"
        >
          <!-- :accept="`${DOCX_FILE_TYPE},${PDF_FILE_TYPE}`" -->
        </AppFileInput>
        <div>
          <label class="text-primary font-semibold">Ký số file phụ lục</label>
          <div class="flex h-10 items-center justify-between">
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="signAppendix"
                inputId="dosignAppendix"
                name="signAppendix"
                :value="true"
                :disabled="!values.appendixFiles?.length"
              />
              <label class="font-semibold" for="dosignAppendix">Có</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="signAppendix"
                inputId="notsignAppendix"
                name="signAppendix"
                :value="false"
                :disabled="!values.appendixFiles?.length"
              />
              <label class="font-semibold" for="notsignAppendix">Không</label>
            </div>
          </div>
        </div>
        <p class="col-span-full italic"><span class="text-red-500">*</span>Thông tin bắt buộc</p>
        <div class="col-span-full flex justify-end gap-4">
          <Button
            type="button"
            class="w-fit"
            variant="outlined"
            @click="handleReset"
            :disabled="isAddingPaperID"
            >Đặt lại</Button
          >
          <Button type="submit" class="w-fit" :loading="isAddingPaperID" label="Xác nhận"></Button>
        </div>
      </div>
    </div>
    <ConfirmDialog group="addDocument" />
  </form>
</template>
