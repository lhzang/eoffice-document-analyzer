<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import SignFlowConfig from '@/shared/components/outDoc/SignFlowConfig.vue'
import {
  APP_DOCUMENT_TYPES,
  DOCX_FILE_TYPE,
  PDF_FILE_TYPE,
  URGENCY_LEVEL_LABELS
} from '@/shared/constants/document'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import {
  OD_SIGN_TYPES,
  type TODMultipleStaffSignTypes,
  type TODSignleStaffSignTypes
} from '@/shared/constants/sign'
import type { FilesBySource } from '@/shared/models/document'
import type { TIssueUnitSelectValue } from '@/shared/models/organization/unit'
import type {
  InDocumentFileVM,
  OutDocumentFileVM,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import { createFileFromUrl, getFileName, getFullFileUrl, toastError } from '@/shared/utils/common'
import { getPriorityOptions } from '@/shared/utils/document'
import {
  transformStaffIntoSignerFormat,
  transformStaffListToFormalFormat
} from '@/shared/utils/outDoc/signer'
import { Button } from 'primevue'
import { ref, useTemplateRef, watch } from 'vue'
import type z from 'zod'
import ModalConfirmRegisterPaperDoc from '../components/modals/ModalConfirmRegisterPaperDoc.vue'
import SelectDestination from '../components/SelectDestination.vue'
import SelectIssueUnit from '../components/SelectIssueUnit.vue'
import { useCreatePaperOutDoc } from '../composables/useCreatePaperOutDoc'
import type { TReRegisterOutDocProps } from '../models/document'
import { createEDocSchema } from '../schemas/documentSchema'
import { prepareCreatePaperOutDocData } from '../utils/document'

type TFormValues = z.infer<typeof createEDocSchema>
type TModalConfirmRegister = InstanceType<typeof ModalConfirmRegisterPaperDoc>

const { isGetDetailSuccess, detailOutDoc } = defineProps<TReRegisterOutDocProps>()

const modalConfirmRegister = useTemplateRef<TModalConfirmRegister>('modalConfirmRegister')

const {
  values,
  errors,
  isCreatingDoc,
  handleSubmit,
  hasStampUnits,
  isGettingHasStampUnits,
  listDirectorThatIncludeAsViewerRoleDestination,
  errorIssueUnit,
  isGettingSignTemplates,
  selectedFlow,
  isLoadingAdditionalDirector,
  getListTemplateOpts,
  handleSelectSignTemplate,
  handleSelectIssueUnit,
  createDoc,
  setFieldValue,
  setValues
} = useCreatePaperOutDoc(true)

const isProcessingForm = ref<boolean>(false)

const confirmRegister = () => {
  modalConfirmRegister?.value?.show(registerDocument)
}

const registerDocument = () => {
  const payload = prepareCreatePaperOutDocData(values as TFormValues, detailOutDoc?.id, [
    ...listDirectorThatIncludeAsViewerRoleDestination?.value?.values()
  ])
  if (payload) createDoc(payload)
}

watch(
  [() => isGetDetailSuccess, () => detailOutDoc],
  async ([isGetDetailSuccess, detailOutDoc]) => {
    try {
      isProcessingForm.value = true

      if (isGetDetailSuccess && detailOutDoc) {
        const relatedUploadFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter((file) => file?.type === 'UPLOADED') as UploadedFileVM[]
        const relatedDocFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter(
          (file) =>
            file?.type === 'INDOC' || file?.type === 'OUTDOC' || file?.type === 'INTERNAL_DOC'
        ) as InDocumentFileVM[] | OutDocumentFileVM[]
        const relatedWorkFiles = Array.from(
          detailOutDoc?.documentFiles?.relatedFiles?.values()
        )?.filter((file) => file?.type === 'WORK') as WorkFileVM[]

        const oldFlow = detailOutDoc?.signFlowVM?.flowStepVMS
          ?.filter((step) => step?.signType !== OD_SIGN_TYPES.creator)
          ?.map((step) => {
            if (
              step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
              step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
              step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
              step?.signType === OD_SIGN_TYPES.staffCollaborator
            ) {
              const listSigners = step?.userApproverVMs?.map((approver) => ({
                signer: transformStaffIntoSignerFormat(approver?.leader),
                userIndex: approver.userIndex
              }))
              return {
                signType: step?.signType as TODMultipleStaffSignTypes,
                staffs: transformStaffListToFormalFormat(listSigners),
                isCollab:
                  listSigners?.length > 1 &&
                  listSigners?.every?.((signer) => signer?.userIndex === 1)
              }
            }
            return {
              signType: step?.signType as TODSignleStaffSignTypes,
              staff: transformStaffIntoSignerFormat(step?.userApproverVMs?.[0]!.leader)
            }
          })
        selectedFlow.value = {
          steps: oldFlow?.map((step) => ({
            signType: step?.signType,
            isCollab: step?.isCollab,
            permittedStaff: []
          }))
        }

        setValues(
          {
            documentType: {
              label: detailOutDoc?.documentType,
              value: detailOutDoc?.documentTypeId
            },
            dueDate: detailOutDoc?.dueDate ? new Date(detailOutDoc?.dueDate) : undefined,
            urgencyLevel: {
              label: URGENCY_LEVEL_LABELS?.[detailOutDoc?.priority],
              value: detailOutDoc?.priority
            },
            subject: detailOutDoc?.subject,
            description: detailOutDoc?.description ?? undefined,
            relatedContent: detailOutDoc?.relatedContent,
            signFlow: oldFlow?.map((step) =>
              step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
              step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
              step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
              step?.signType === OD_SIGN_TYPES.staffCollaborator
                ? {
                    signType: step?.signType as TODMultipleStaffSignTypes,
                    staffs: step?.staffs ?? []
                  }
                : {
                    signType: step?.signType as Exclude<TODSignleStaffSignTypes, 'MINOR_SIGNER'>,
                    staff: step?.staff ?? null
                  }
            )
          },
          false
        )
        const promiseMainFile = createFileFromUrl(
          getFullFileUrl(detailOutDoc?.documentFiles?.mainFile),
          getFileName(detailOutDoc?.documentFiles?.mainFile)
        )
          .then((file) => setFieldValue('mainFile', file))
          .catch(console.log)

        const promiseannexesFiles = Promise.allSettled(
          (detailOutDoc?.documentFiles?.annexes ?? []).map((p) =>
            createFileFromUrl(getFullFileUrl(p), getFileName(p))
          )
        ).then((results) => {
          const fulfilled = results.filter((r) => r.status === 'fulfilled')
          const rejected = results.filter((r) => r.status === 'rejected')
          if (rejected.length) console.log(rejected.map((r) => r.reason))
          setFieldValue(
            'annexesFiles',
            fulfilled.map((r) => r.value)
          )
        })

        const promiseRelatedFiles = Promise.allSettled(
          (relatedUploadFiles ?? []).map((f) =>
            createFileFromUrl(getFullFileUrl(f?.path), getFileName(f?.path))
          )
        ).then((results) => {
          const fulfilled = results.filter((r) => r.status === 'fulfilled')
          const rejected = results.filter((r) => r.status === 'rejected')
          if (rejected.length) console.log(rejected.map((r) => r.reason))

          setFieldValue('relatedFiles', {
            fromDoc: (relatedDocFiles ?? []).map((file) => ({
              type: 'fromDoc',
              id: file?.documentId,
              name: file?.subject,
              docType:
                file?.type === 'INDOC'
                  ? APP_DOCUMENT_TYPES.inDoc
                  : file?.type === 'OUTDOC'
                    ? APP_DOCUMENT_TYPES.outDoc
                    : APP_DOCUMENT_TYPES.internalDoc
            })),
            upload: fulfilled.map((r) => ({
              type: 'upload',
              file: r.value
            })),
            fromTask: (relatedWorkFiles ?? []).map((file) => ({
              type: 'fromTask',
              id: file?.workId,
              name: file?.title
            }))
          })
        })
        await Promise.allSettled([promiseMainFile, promiseannexesFiles, promiseRelatedFiles])
      }
    } catch (e) {
      toastError({
        detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi lấy thông tin chi tiết văn bản'
      })
    } finally {
      isProcessingForm.value = false
    }
  },
  { immediate: true }
)

const onSubmit = handleSubmit(confirmRegister)
</script>
<template>
  <div class="h-full">
    <div v-if="isProcessingForm" class="flex h-full items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else>
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
        <div class="mt-4 grid grid-cols-2 gap-4">
          <SelectIssueUnit
            :stamp-user-position-id="
              values?.signFlow?.find((step) => step?.signType === OD_SIGN_TYPES?.majorSigner)?.staff
                ?.positionId
            "
            :model-value="values?.issueUnit as TIssueUnitSelectValue"
            :hasStampUnits="hasStampUnits ?? []"
            :disabled="isGettingHasStampUnits"
            :errorMessage="errorIssueUnit"
            @submit="handleSelectIssueUnit"
          />
          <SelectDestination
            :key="values?.issueUnit?.id"
            :unit-id="values?.issueUnit?.id"
            :disabled="isLoadingAdditionalDirector || !values?.issueUnit"
            :errorMessage="errors?.destinations"
            :readOnlySelectedDestinations="listDirectorThatIncludeAsViewerRoleDestination"
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
      <ModalConfirmRegisterPaperDoc
        :destinations="values?.destinations"
        ref="modalConfirmRegister"
      />
    </div>
  </div>
</template>
