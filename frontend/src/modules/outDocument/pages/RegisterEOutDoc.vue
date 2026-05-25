<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import SignFlowConfig from '@/shared/components/outDoc/SignFlowConfig.vue'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import {
  DOCX_FILE_TYPE,
  PDF_FILE_TYPE,
  RECEIVER_SYSTEM_TYPES,
  RECEIVER_TYPES
} from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import type { FilesBySource } from '@/shared/models/document'
import type { TIssueUnitSelectValue } from '@/shared/models/organization/unit'
import { OUT_DOC_PROCESS_TYPES } from '@/shared/models/outDoc/document'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { checkMatchEnv, toastError } from '@/shared/utils/common'
import { getPriorityOptions } from '@/shared/utils/document'
import { Button, RadioButton } from 'primevue'
import { ref, useTemplateRef } from 'vue'
import type z from 'zod'
import ListCreatedDocForReplacement from '../components/ListCreatedDocForReplacement.vue'
import ModalConfirmDestinationWhenRegister from '../components/modals/ModalConfirmDestinationWhenRegister.vue'
import ModalPreviewCreateDoc from '../components/modals/ModalPreviewCreateDoc.vue'
import SelectDestination from '../components/SelectDestination.vue'
import SelectIssueUnit from '../components/SelectIssueUnit.vue'
import SelectJointUnit from '../components/SelectJointUnit.vue'
import { useCreateEOutDoc } from '../composables/useCreateEOutDoc'
import type { TJointUnitSelectValue } from '../models/document'
import { createEDocSchema } from '../schemas/documentSchema'
import { prepareCreateData, preparePreviewCreateDocData } from '../utils/document'

type TModalPreviewDoc = InstanceType<typeof ModalPreviewCreateDoc>
type TModalConfirmDestination = InstanceType<typeof ModalConfirmDestinationWhenRegister>
type TFormValues = z.infer<typeof createEDocSchema>

const previewModalDoc = ref<TModalPreviewDoc | null>(null)
const modalConfirmDestination = useTemplateRef<TModalConfirmDestination>('modalConfirmDestination')

const {
  values,
  errors,
  isCreatingDoc,
  handleSubmit,
  hasStampUnits,
  isGettingHasStampUnits,
  listDirectorThatIncludeAsViewerRoleDestination,
  creatorSignFile,
  errorIssueUnit,
  errorReplaceDoc,
  errorJointUnits,
  jointUnits,
  isGettingSignTemplates,
  selectedFlow,
  selectableJointUnitIds,
  isLoadingAdditionalDirector,
  setJointUnits,
  handleChooseProcessType,
  getListTemplateOpts,
  handleSelectSignTemplate,
  handleSelectIssueUnit,
  genDocumentProcessType,
  createDoc,
  setFieldValue
} = useCreateEOutDoc(false)

const registerDocument = () => {
  const payload = prepareCreateData(values as TFormValues, undefined, [
    ...listDirectorThatIncludeAsViewerRoleDestination?.value?.values()
  ])
  if (payload) createDoc(payload)
}

const previewDoc = () => {
  const previewData = preparePreviewCreateDocData(values as TFormValues)
  if (previewData) previewModalDoc.value?.openModal(previewData)
}

const onSubmit = handleSubmit(async (values) => {
  if (
    checkMatchEnv(['hmu_staging', 'prod_hmu', 'hmuh_staging', 'prod_hmuh']) &&
    values?.destinations?.every((destination) => {
      if (destination?.type === RECEIVER_TYPES.STAFF) {
        return destination?.roleInUnit !== ROLE_IN_UNIT_VALUES.director
      }
      return true
    }) &&
    values?.issueUnit?.isOrganization
  ) {
    return toastError({ detail: 'Vui lòng chọn ít nhất một thành viên trong Ban Giám Hiệu' })
  }
  if (
    values?.destinations?.some(
      (destination) =>
        destination?.systemType === RECEIVER_SYSTEM_TYPES.external && !destination?.axisOrgId
    )
  )
    return modalConfirmDestination.value?.show(previewDoc)
  previewDoc()
})
</script>
<template>
  <div>
    <form @submit="onSubmit">
      <div class="grid grid-cols-4 gap-4">
        <AppSelect
          class="col-span-2 lg:col-span-1"
          name="documentType"
          label="Loại văn bản"
          required
          :fetch-options="fetchMoreDocumentTypeOptions"
        />
        <AppDateInput
          class="col-span-2 lg:col-span-1"
          name="dueDate"
          :date-format="'dd/mm/yy'"
          label="Hạn trả lời"
          :min-date="new Date()"
        />
        <AppSelect
          class="col-span-2 lg:col-span-1"
          label="Độ khẩn"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="urgencyLevel"
          :searchable="false"
          :fetch-options="getPriorityOptions"
        ></AppSelect>
        <AppSelect
          class="col-span-2 lg:col-span-1"
          label="Loại xử lý"
          required
          :placeholder="MSG_PLEASE_SELECT"
          name="processType"
          :searchable="false"
          :fetch-options="genDocumentProcessType"
          :multiple="false"
          @select="handleChooseProcessType"
        ></AppSelect>
        <ListCreatedDocForReplacement
          class="col-span-4"
          :errorMessage="errorReplaceDoc"
          @document-select="(docId) => setFieldValue('replaceDocId', docId)"
          v-if="values?.processType?.value === OUT_DOC_PROCESS_TYPES.replace"
        />
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
          label="Ghi chú"
          :limit-number="250"
          class="col-span-2"
        />
      </div>

      <!-- Sign flow here -->

      <div class="mt-4">
        <div class="flex items-center gap-4">
          <span class="text-primary font-semibold">Mẫu trình tự ký</span>
          <AppSelect
            class="w-[200px] overflow-hidden"
            placeholder="Chọn trình tự ký"
            name="template"
            :disabled="isGettingSignTemplates"
            :fetch-options="getListTemplateOpts"
            is-fetch-on-init
            :multiple="false"
            select-first-on-default
            @change="handleSelectSignTemplate"
          />
        </div>
      </div>

      <SignFlowConfig type="out" class="mt-4" v-if="selectedFlow" :selectedFlow />

      <!-- End flow -->
      <div class="mt-4 grid grid-cols-4 gap-4">
        <AppFileInput
          name="mainFile"
          class="col-span-2"
          :accept="`${DOCX_FILE_TYPE},${PDF_FILE_TYPE}`"
          label="File văn bản"
          required
        />
        <div>
          <label class="text-primary font-semibold">Người tạo ký file văn bản</label>
          <div class="flex h-10 items-center justify-between">
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="creatorSignFile"
                inputId="doCreatorSignFile"
                name="creatorSignFile"
                :value="true"
                :disabled="!values.mainFile"
              />
              <label class="font-semibold" for="doCreatorSignFile">Có</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton
                v-model="creatorSignFile"
                inputId="notCreatorSignFile"
                name="creatorSignFile"
                :value="false"
                :disabled="!values.mainFile"
              />
              <label class="font-semibold" for="notCreatorSignFile">Không</label>
            </div>
          </div>
        </div>
      </div>
      <div class="text-primary mt-4 underline">
        <a :href="appConfig.VITE_TEMPLATE_DOC_URL" target="_blank"
          >Văn bản mẫu và thể thức quy định</a
        >
      </div>
      <div class="mt-4 grid grid-cols-4 gap-4">
        <AppFileInput
          name="annexesFiles"
          class="col-span-2"
          :multiple="true"
          label="File phụ lục đính kèm"
        />
      </div>
      <AppReferenceFile
        @confirm="
          (referenceFiles) => {
            console.log(referenceFiles, 'referenceFiles')
            setFieldValue('relatedFiles', referenceFiles)
          }
        "
        :model-value="values.relatedFiles as FilesBySource"
      >
        <template #triggerElement="{ onClick }">
          <span @click="onClick" class="text-primary cursor-pointer underline">
            {{
              `Chọn file căn cứ (${(values?.relatedFiles?.fromDoc ?? [])?.length + (values?.relatedFiles?.fromTask ?? [])?.length + (values?.relatedFiles?.upload ?? [])?.length} tệp)`
            }}
          </span>
        </template>
      </AppReferenceFile>
      <AppTextarea
        name="relatedContent"
        label="Nội dung căn cứ"
        :limit-number="250"
        placeholder="Nhập nội dung căn cứ"
      />
      <div class="mt-4 grid grid-cols-6 gap-4">
        <SelectIssueUnit
          :stamp-user-position-id="
            values?.signFlow?.find((step) => step?.signType === OD_SIGN_TYPES?.majorSigner)?.staff
              ?.positionId
          "
          :class="
            values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint ? 'col-span-2' : 'col-span-3'
          "
          :model-value="values?.issueUnit as TIssueUnitSelectValue"
          :hasStampUnits="hasStampUnits ?? []"
          :disabled="isGettingHasStampUnits"
          :errorMessage="errorIssueUnit"
          @submit="handleSelectIssueUnit"
        />
        <SelectJointUnit
          v-if="values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint"
          :class="
            values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint ? 'col-span-2' : 'col-span-3'
          "
          :model-value="(jointUnits ?? []) as TJointUnitSelectValue[]"
          :has-stamp-units="
            hasStampUnits?.map((unit) => ({ id: unit?.id, name: unit?.name })) ?? []
          "
          @submit="(jointUnits) => setJointUnits(jointUnits)"
          :selectableUnitId="selectableJointUnitIds"
          :error-message="errorJointUnits"
        />
        <SelectDestination
          :key="values?.issueUnit?.id"
          :unit-id="values?.issueUnit?.id"
          :disabled="isLoadingAdditionalDirector || !values?.issueUnit"
          :errorMessage="errors?.destinations"
          :readOnlySelectedDestinations="listDirectorThatIncludeAsViewerRoleDestination"
          :class="
            values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint ? 'col-span-2' : 'col-span-3'
          "
          @submit="(destinations) => setFieldValue('destinations', [...destinations?.values()])"
        />
      </div>
      <div class="mt-10 flex justify-end">
        <Button
          type="submit"
          class="min-w-[100px]"
          :loading="isCreatingDoc"
          label="Đăng ký"
          severity="primary"
        />
      </div>
    </form>
    <ModalConfirmDestinationWhenRegister ref="modalConfirmDestination" />
    <ModalPreviewCreateDoc ref="previewModalDoc" @confirm-register="registerDocument" />
  </div>
</template>
