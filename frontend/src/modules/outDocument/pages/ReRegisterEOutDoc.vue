<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppFileInput from '@/shared/components/form-elements/AppFileInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppReferenceFile from '@/shared/components/modals/reference-file-modal/AppReferenceFile.vue'
import SignFlowConfig from '@/shared/components/outDoc/SignFlowConfig.vue'
import {
  APP_DOCUMENT_TYPES,
  DOCX_FILE_TYPE,
  PDF_FILE_TYPE,
  RECEIVER_SYSTEM_TYPES,
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
import { OUT_DOC_PROCESS_LABEL, OUT_DOC_PROCESS_TYPES } from '@/shared/models/outDoc/document'
import type {
  InDocumentFileVM,
  OutDocumentFileVM,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'
import { fetchMoreDocumentTypeOptions } from '@/shared/utils/clerical/adminDocTypes.shared'
import {
  cleanObject,
  createFileFromUrl,
  getFileName,
  getFullFileUrl,
  toastError
} from '@/shared/utils/common'
import { getPriorityOptions } from '@/shared/utils/document'
import {
  transformStaffIntoSignerFormat,
  transformStaffListToFormalFormat
} from '@/shared/utils/outDoc/signer'
import { Button, RadioButton } from 'primevue'
import { ref, useTemplateRef, watch } from 'vue'
import type z from 'zod'
import ModalConfirmDestinationWhenRegister from '../components/modals/ModalConfirmDestinationWhenRegister.vue'
import ModalPreviewCreateDoc from '../components/modals/ModalPreviewCreateDoc.vue'
import SelectDestination from '../components/SelectDestination.vue'
import SelectIssueUnit from '../components/SelectIssueUnit.vue'
import SelectJointUnit from '../components/SelectJointUnit.vue'
import { useCreateEOutDoc } from '../composables/useCreateEOutDoc'
import type { TJointUnitSelectValue, TReRegisterOutDocProps } from '../models/document'
import type { createEDocSchema } from '../schemas/documentSchema'
import { prepareCreateData, preparePreviewCreateDocData } from '../utils/document'
type TModalConfirmDestination = InstanceType<typeof ModalConfirmDestinationWhenRegister>
type TFormValues = z.infer<typeof createEDocSchema>
type TModalPreviewDoc = InstanceType<typeof ModalPreviewCreateDoc>

const { isGetDetailSuccess, detailOutDoc } = defineProps<TReRegisterOutDocProps>()

const isProcessingForm = ref<boolean>(false)

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
  errorJointUnits,
  jointUnits,
  isGettingSignTemplates,
  selectedFlow,
  selectableJointUnitIds,
  isLoadingAdditionalDirector,
  setJointUnits,
  getListTemplateOpts,
  handleSelectSignTemplate,
  handleSelectIssueUnit,
  createDoc,
  setValues,
  setFieldValue
} = useCreateEOutDoc(true)

const previewModalDoc = ref<TModalPreviewDoc | null>(null)
const modalConfirmDestination = useTemplateRef<TModalConfirmDestination>('modalConfirmDestination')

const registerDocument = () => {
  const payload = prepareCreateData(values as TFormValues, detailOutDoc?.id, [
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
    values?.destinations?.some(
      (destination) =>
        destination?.systemType === RECEIVER_SYSTEM_TYPES.external && !destination?.axisOrgId
    )
  )
    return modalConfirmDestination.value?.show(previewDoc)
  previewDoc()
})

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

        const processType =
          detailOutDoc?.jointUnits?.length > 0
            ? {
                value: OUT_DOC_PROCESS_TYPES.joint,
                label: OUT_DOC_PROCESS_LABEL.JOINT
              }
            : detailOutDoc?.replacementDocId
              ? {
                  value: OUT_DOC_PROCESS_TYPES.replace,
                  label: OUT_DOC_PROCESS_LABEL.REPLACEMENT
                }
              : detailOutDoc?.isEnglish
                ? {
                    value: OUT_DOC_PROCESS_TYPES.english,
                    label: OUT_DOC_PROCESS_LABEL.ENGLISH
                  }
                : detailOutDoc?.haveNumber
                  ? {
                      value: OUT_DOC_PROCESS_TYPES.normal,
                      label: OUT_DOC_PROCESS_LABEL.NORMAL
                    }
                  : {
                      value: OUT_DOC_PROCESS_TYPES.noNum,
                      label: OUT_DOC_PROCESS_LABEL.NO_NUMBER
                    }

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
          cleanObject({
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
            processType: processType,
            processTypeValue:
              processType?.value === OUT_DOC_PROCESS_TYPES.joint
                ? OUT_DOC_PROCESS_TYPES?.joint
                : processType?.value === OUT_DOC_PROCESS_TYPES?.replace
                  ? OUT_DOC_PROCESS_TYPES?.replace
                  : OUT_DOC_PROCESS_TYPES.normal,
            creatorSignFile: detailOutDoc?.signFlowVM?.flowStepVMS?.some(
              (step) => step?.signType === OD_SIGN_TYPES.creator
            ),
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
                    signType: step?.signType as TODSignleStaffSignTypes,
                    staff: step?.staff ?? null
                  }
            )
          }),
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
            label="Hạn trả lời"
            date-format="dd/mm/yy"
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
          <AppTextInput
            class="col-span-2 lg:col-span-1"
            label="Văn bản liên tịch"
            :model-value="values?.processTypeValue === OUT_DOC_PROCESS_TYPES.joint ? 'Có' : 'Không'"
            required
            name="isJoint"
            disabled
          ></AppTextInput>
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
          :model-value="values?.relatedFiles as FilesBySource"
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
            :model-value="values?.issueUnit as TIssueUnitSelectValue"
            :class="
              values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint
                ? 'col-span-2'
                : 'col-span-3'
            "
            :hasStampUnits="hasStampUnits ?? []"
            :disabled="isGettingHasStampUnits"
            :errorMessage="errorIssueUnit"
            @submit="handleSelectIssueUnit"
          />
          <SelectJointUnit
            v-if="values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint"
            :class="
              values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint
                ? 'col-span-2'
                : 'col-span-3'
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
              values?.processType?.value === OUT_DOC_PROCESS_TYPES.joint
                ? 'col-span-2'
                : 'col-span-3'
            "
            @submit="(destinations) => setFieldValue('destinations', [...destinations?.values()])"
          />
        </div>
        <div class="mt-10 flex justify-end">
          <Button
            type="submit"
            class="min-w-[100px]"
            :loading="isCreatingDoc"
            label="Trình lại"
            severity="primary"
          />
        </div>
      </form>
      <ModalConfirmDestinationWhenRegister ref="modalConfirmDestination" />
      <ModalPreviewCreateDoc ref="previewModalDoc" @confirm-register="registerDocument" />
    </div>
  </div>
</template>
