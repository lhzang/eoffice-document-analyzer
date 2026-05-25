<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import SignFlowConfig from '@/shared/components/outDoc/SignFlowConfig.vue'
import { DOCX_FILE_TYPE, PDF_FILE_TYPE } from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { FilesBySource } from '@/shared/models/document'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { fetchMoreFullDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { getPriorityOptions } from '@/shared/utils/document'
import { Button, RadioButton } from 'primevue'
import { ref } from 'vue'
import type z from 'zod'
import ModalPreviewCreateDoc from '../components/modals/ModalPreviewCreateDoc.vue'
import SelectDestination from '../components/SelectDestination.vue'
import { useReCreateInternalDoc } from '../composables/useReCreateInternalDoc'
import { createInternalDocSchema } from '../schemas/documentSchema'
import { prepareCreateData, preparePreviewCreateDocData } from '../utils/document'

type TModalPreviewDoc = InstanceType<typeof ModalPreviewCreateDoc>
type TFormValues = z.infer<typeof createInternalDocSchema>

const previewModalDoc = ref<TModalPreviewDoc | null>(null)

const {
  values,
  destinationsErrorMessage,
  isReCreatingDoc,
  handleSubmit,
  listDirectorThatIncludeAsViewerRoleDestination,
  creatorSignFile,
  isGettingSignTemplates,
  selectedFlow,
  handleSelectDocumentType,
  isLoadingAdditionalDirector,
  getListTemplateOpts,
  handleSelectSignTemplate,
  genDocumentProcessType,
  reCreateDoc,
  setFieldValue,
  isGettingDocInfo,
  isProcessingForm,
  error,
  detailInternalDoc
} = useReCreateInternalDoc()

const registerDocument = () => {
  if (!user?.currentPosition?.unitId) return
  const payload = prepareCreateData(values as TFormValues, user?.currentPosition?.unitId, [
    ...listDirectorThatIncludeAsViewerRoleDestination?.value?.values()
  ])
  if (payload && detailInternalDoc?.value?.id)
    reCreateDoc({ ...payload, documentId: detailInternalDoc?.value?.id })
}
const user = useUserProfileStore().user
const previewDoc = () => {
  if (!user?.currentPosition?.unitId) return
  const previewData = preparePreviewCreateDocData(
    values as TFormValues,
    user?.currentPosition?.unitId
  )
  if (previewData) previewModalDoc.value?.openModal(previewData)
}

const onSubmit = handleSubmit(() => {
  previewDoc()
})
</script>
<template>
  <div class="h-full">
    <div
      v-if="isGettingDocInfo || isProcessingForm"
      class="flex h-full items-center justify-center"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="error" class="flex h-full items-center justify-center">
      <span class="text-xl">{{
        error?.response?.data?.detail ?? error?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
      }}</span>
    </div>
    <div v-else>
      <form @submit="onSubmit">
        <div class="grid grid-cols-6 gap-4">
          <AppSelect
            class="col-span-3 lg:col-span-2"
            label="Độ khẩn"
            required
            :placeholder="MSG_PLEASE_SELECT"
            name="urgencyLevel"
            :searchable="false"
            :fetch-options="getPriorityOptions"
          ></AppSelect>
          <AppDateInput
            class="col-span-3 lg:col-span-2"
            name="dueDate"
            :date-format="'dd/mm/yy'"
            label="Hạn trả lời"
            :min-date="new Date()"
          />

          <AppSelect
            class="col-span-3 lg:col-span-2"
            label="Loại xử lý"
            required
            :placeholder="MSG_PLEASE_SELECT"
            name="processType"
            :searchable="false"
            :fetch-options="genDocumentProcessType"
            :multiple="false"
          ></AppSelect>
          <AppSelect
            class="col-span-3 lg:col-span-2"
            name="documentType"
            label="Loại văn bản"
            required
            @select="handleSelectDocumentType"
            :fetch-options="fetchMoreFullDocumentTypeOptions"
          />
          <AppTextInput
            class="col-span-3 lg:col-span-2"
            name="issueUnit"
            label="Đơn vị người trình"
            read-only
            :model-value="user?.currentPosition?.unitName"
          ></AppTextInput>
          <AppTextInput
            class="col-span-3 lg:col-span-2"
            name="notation"
            label="Số và ký hiệu văn bản"
            :disabled="!values?.documentType"
            required
            hint-content="Nội dung toàn bộ của dòng Số: trong văn bản"
            placeholder="Vui lòng nhập số ký hiệu..."
            iconClass="mt-0! -translate-y-1/2! flex! items-center"
            :inputPt="{
              root: {
                class: '!text-red-500'
              }
            }"
            :inputStyle="{ paddingLeft: `calc(${50}px + 12px)`, color: '' }"
          >
            <template #prefixIcon>
              <div ref="outOrdinalIcon">{{ 'XXXX' }}/</div>
            </template>
          </AppTextInput>
          <AppTextarea
            name="subject"
            label="Trích yếu nội dung"
            required
            :limit-number="250"
            placeholder="Nhập trích yếu nội dung..."
            class="col-span-3"
          />
          <AppTextarea
            name="description"
            placeholder="Nhập ghi chú..."
            label="Ghi chú"
            :limit-number="250"
            class="col-span-3"
          />
        </div>

        <!-- Sign flow here -->

        <div class="mt-4">
          <div class="flex items-center gap-4">
            <span class="text-primary font-semibold">Mẫu trình tự ký</span>
            <AppSelect
              class="w-[200px]"
              placeholder="Chọn trình tự ký"
              name="template"
              :disabled="isGettingSignTemplates"
              :fetch-options="getListTemplateOpts"
              :multiple="false"
              @change="handleSelectSignTemplate"
            />
          </div>
        </div>

        <SignFlowConfig type="internal" class="mt-4" v-if="selectedFlow" :selectedFlow />

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
          @confirm="(referenceFiles) => setFieldValue('relatedFiles', referenceFiles)"
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
        <SelectDestination
          :disabled="isLoadingAdditionalDirector"
          :errorMessage="destinationsErrorMessage"
          required
          :readOnlySelectedDestinations="listDirectorThatIncludeAsViewerRoleDestination"
          :class="'col-span-2'"
          @submit="(destinations) => setFieldValue('destinations', [...destinations?.values()])"
        />
        <div class="mt-10 flex justify-end">
          <Button
            type="submit"
            class="min-w-[100px]"
            :loading="isReCreatingDoc"
            label="Đăng ký"
            severity="primary"
          />
        </div>
      </form>
      <ModalPreviewCreateDoc ref="previewModalDoc" @confirm-register="registerDocument" />
    </div>
  </div>
</template>
