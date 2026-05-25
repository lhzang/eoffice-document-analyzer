<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onUnmounted, ref, watch } from 'vue'

import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import { downLoadDocumentFileViaUrl, getFileName, getFullFileUrl } from '@/shared/utils/common'

import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import type { DetailInDocumentVM } from '@/shared/services/api'
import { isDoc, isImage, isPdf } from '@/shared/utils/check'
import { getUrgencyLevelOptions, getUrgencyLevelSelectData } from '@/shared/utils/document'
import { DateTime } from 'luxon'
import { RadioButton, RadioButtonGroup, useToast } from 'primevue'
import { useUpdateXroadDoc } from '../composables/queries/useUpdateXroadDoc'
import { updateXroadDocumentSchema } from '../schemas/common'
import ModalViewOldDoc from './ModalViewOldDoc.vue'

type TProps = {
  documentDetail: DetailInDocumentVM
}

type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>
type TViewOldDocModalRef = InstanceType<typeof ModalViewOldDoc>

const { documentDetail } = defineProps<TProps>()

const addDocBookFormTypeValidations = toTypedSchema(updateXroadDocumentSchema)

const emit = defineEmits<{
  success: []
  mainFileSelected: [filePath: string]
}>()

const previewModalRef = ref<TPreviewModalRef | null>(null)
const viewOldDocModalRef = ref<TViewOldDocModalRef | null>(null)

const { defineField, handleSubmit, setValues, resetForm, errors } = useForm({
  validationSchema: addDocBookFormTypeValidations
})

const toast = useToast()
const { mutate: updateXroadDocument, isPending: isUpdatingDoc } = useUpdateXroadDoc({
  onSuccess: () => {
    toast.add({
      severity: 'success',
      life: 3000,
      summary: 'Cập nhật văn bản thành công'
    })
    emit('success')
  }
})

const [mainFilePath] = defineField('mainFilePath')

const onSubmit = handleSubmit((formData) => {
  if (formData?.mainFilePath)
    updateXroadDocument({
      docId: documentDetail?.documentId,
      metadata: {
        code: documentDetail?.proposedUpdate?.documentCode,
        issuer: formData?.issuedUnit,
        signerInfo: {
          name: formData.signerName,
          position: formData.signerPosition
        },
        documentType: documentDetail?.documentType,
        arrivalDate: DateTime.fromJSDate(formData.arrivalDate).toISODate() ?? '',
        dueDate: formData?.dueDate
          ? DateTime.fromJSDate(formData?.dueDate).toISODate()!
          : undefined,
        priority: formData?.priority?.value,
        subject: formData.subject,
        description: formData.description
      },
      // mainFile?: File
      mainFilePath: formData.mainFilePath,
      // annexes?: File[]
      annexPaths: formData.annexesPath ?? []
    })
})

const urgencyLevels = getUrgencyLevelOptions()

defineExpose({
  onSubmit,
  isUpdatingDoc
})

onUnmounted(() => resetForm())

watch(
  () => documentDetail,
  (newData) => {
    if (newData)
      setValues(
        {
          issuedDate: newData?.proposedUpdate?.issuedDate
            ? new Date(newData?.proposedUpdate?.issuedDate)
            : null,
          arrivalDate: new Date(newData?.proposedUpdate?.arrivalDate),
          priority: urgencyLevels.find(
            (priority) => priority.value === newData?.proposedUpdate?.priority
          ),
          dueDate: newData?.proposedUpdate?.dueDate
            ? new Date(newData?.proposedUpdate?.dueDate)
            : null,
          issuedUnit: newData?.issuedUnit,
          subject: newData?.proposedUpdate?.subject,
          description: newData?.proposedUpdate?.description,
          signerName: newData?.proposedUpdate?.signerName,
          signerPosition: newData?.proposedUpdate?.signerPosition,
          mainFilePath: newData?.proposedUpdate.mainFile,
          annexesPath: newData?.proposedUpdate.annexes
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
          <AppDateInput
            disabled
            name="issuedDate"
            label="Ngày ban hành"
            placeholder="Chọn ngày"
            :date-format="'dd/mm/yy'"
          />
          <AppDateInput
            name="arrivalDate"
            label="Ngày đến"
            placeholder="Chọn ngày"
            :date-format="'dd/mm/yy'"
            required
            disabled
            :error-message="errors.arrivalDate"
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
          name="issuedUnit"
          :label-class="'inline-block mb-1'"
          label="Cơ quan ban hành"
          placeholder="Cơ quan ban hành"
          required
          disabled
        />
        <AppTextarea
          name="subject"
          label="Trích yếu nội dung"
          :label-class="'inline-block mb-1'"
          placeholder="Nhập trích yếu nội dung"
          required
          :limit-number="250"
          :error-message="errors.subject"
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
        <div class="w-full">
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
        <div>
          <div class="mb-1 flex w-full flex-col">
            <div
              class="text-primary cursor-pointer font-semibold hover:underline"
              @click="viewOldDocModalRef?.openModal(documentDetail.documentId)"
            >
              Xem thông tin văn bản cũ
            </div>
          </div>
        </div>
      </div>
    </form>
    <ModalPreviewFile ref="previewModalRef" />
    <ModalViewOldDoc ref="viewOldDocRef" />
  </div>
</template>
