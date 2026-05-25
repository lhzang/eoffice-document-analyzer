import { useGetListUnitSignTemplate } from '@/modules/organization/composables/queries/signFlow/useGetListUnitSignTemplate'
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import {
  APP_DOCUMENT_TYPES,
  DOCUMENT_PROCESS_ROLES,
  URGENCY_LEVEL_LABELS,
  UrgentLevelsEnum
} from '@/shared/constants/document'
import { ROUTE_PATHS } from '@/shared/constants/router'
import type {
  DocumentType,
  InDocumentFileVM,
  OutDocumentFileVM,
  UploadedFileVM,
  WorkFileVM
} from '@/shared/services/api'

import {
  OD_SIGN_TYPES,
  type TODMultipleStaffSignTypes,
  type TODSignleStaffSignTypes
} from '@/shared/constants/sign'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'

import { OUT_DOC_PROCESS_LABEL, OUT_DOC_PROCESS_TYPES } from '@/shared/models/outDoc/document'
import type { TDocumentSignSteps } from '@/shared/models/outDoc/signer'
import type { StaffVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import {
  cleanObject,
  createFileFromUrl,
  getFileName,
  getFullFileUrl,
  toastError,
  toastSucceed
} from '@/shared/utils/common'
import {
  formatSelectValueForInternalStaffFromStaffData,
  getListUnitThatNeedIncludeLeaderInDestination
} from '@/shared/utils/outDoc/destination'
import { toTypedSchema } from '@vee-validate/zod'
import { difference } from 'lodash-es'
import { useField, useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { INTERNAL_DOC_PROCESS_TYPES_LIST } from '../constants/documents'
import { createInternalDocSchema } from '../schemas/documentSchema'
import { useGetDetailInternalDoc } from './queries/useGetDetailInternalDoc'
import { useReCreateInternalDoc as useReCreateInternalDocQuery } from './queries/useReCreateInternalDoc'
import { transformStaffIntoSignerFormat, transformStaffListToFormalFormat } from '@/shared/utils/outDoc/signer'

export const useReCreateInternalDoc = () => {
  const router = useRouter()
  const route = useRoute()

  const selectedFlow = ref<TDocumentSignSteps>()
  const listUnitThatHasToIncludeDirectorAsViewerRole = ref<string[]>([])
  const isProcessingForm = ref<boolean>(false)

  const listDirectorThatIncludeAsViewerRole = ref<StaffVM[]>([])
  const isLoadingAdditionalDirector = ref<boolean>(false)

  const listDirectorThatIncludeAsViewerRoleDestination = computed(() => {
    const formatedValues = new Map<string, TFormSelectDestinationValue>()
    listDirectorThatIncludeAsViewerRole?.value?.forEach((director) => {
      const posId = director?.positions?.[0]?.id
      if (posId) {
        formatedValues.set(posId, {
          ...formatSelectValueForInternalStaffFromStaffData(director),
          formName: DOCUMENT_PROCESS_ROLES.Viewer
        })
      }
    })
    return formatedValues
  })

  const validationSchema = computed(() => {
    const schema = createInternalDocSchema.extend({
      template: createInternalDocSchema.shape.template.superRefine((val, ctx) => {
        if (!val) {
          ctx.addIssue({
            code: 'custom',
            message: 'Vui lòng chọn mẫu trình tự ký',
            path: ['template']
          })
        }
      }),
      destinations: createInternalDocSchema.shape.destinations.superRefine((val, ctx) => {
        if (
          (val ?? [])?.length === 0 &&
          listDirectorThatIncludeAsViewerRoleDestination.value?.size === 0
        ) {
          ctx.addIssue({
            code: 'custom',
            message: 'Vui lòng chọn ít nhất một nơi nhận',
            path: ['destinations']
          })
        }
      })
    })
    return toTypedSchema(schema)
  })

  const { values, errors, handleSubmit, setFieldValue, setValues, submitCount } = useForm({
    validationSchema,
    initialValues: {
      processType: INTERNAL_DOC_PROCESS_TYPES_LIST?.[0],
      creatorSignFile: false,
      urgencyLevel: {
        label: URGENCY_LEVEL_LABELS?.NORMAL,
        value: UrgentLevelsEnum.Normal
      },
      relatedFiles: {
        fromDoc: [],
        fromTask: [],
        upload: []
      },
      destinations: []
    }
  })
  const user = useUserProfileStore().user
  const {
    data: detailInternalDoc,
    isLoading: isGettingDocInfo,
    isSuccess: isGetDetailSuccess,
    error
  } = useGetDetailInternalDoc(() => route.params.id as string, {
    enabled: () => !!(route.params.id as string)
  })

  const { mutate: reCreateDoc, isPending: isReCreatingDoc } = useReCreateInternalDocQuery({
    onSuccess: () => {
      toastSucceed({ detail: 'Trình lại văn bản nội bộ thành công' })
      router.push(ROUTE_PATHS.internalDoc.created)
    }
  })

  const { meta: destinationsMeta } = useField('destinations')
  const destinationsErrorMessage = computed(() => {
    return destinationsMeta.touched || submitCount.value > 0 || Object.keys(errors.value).length > 0
      ? errors.value.destinations
      : undefined
  })

  const { value: creatorSignFile } = useField('creatorSignFile')

  const genDocumentProcessType = () => {
    return {
      options: INTERNAL_DOC_PROCESS_TYPES_LIST,
      hasMore: false
    }
  }

  const {
    data: listSignTemplate,
    isLoading: isGettingSignTemplates,
    isSuccess: isGetListTemplateSuccess
  } = useGetListUnitSignTemplate(() => user?.currentPosition?.unitId!, 'internal', {
    enabled: !!user?.currentPosition?.unitId
  })

  const getListTemplateOpts = () => {
    return {
      options:
        listSignTemplate?.value?.map((template) => ({
          label: template?.name,
          value: template
        })) ?? [],
      hasMore: false
    }
  }

  const getFormatedFlow = (template: TDocumentSignSteps) => {
    return template?.steps.map((step) => {
      if (
        step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
        step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
        step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
        step?.signType === OD_SIGN_TYPES.staffCollaborator
      ) {
        return {
          signType: step?.signType as TODMultipleStaffSignTypes,
          staffs: []
        }
      } else {
        return {
          signType: step?.signType as TODSignleStaffSignTypes,
          staff: null!
        }
      }
    })
  }

  const handleSelectSignTemplate = (template: TCommonSelectOptions<TDocumentSignSteps>) => {
    if (template?.value) {
      selectedFlow.value = {
        id: template?.value?.id,
        steps: template?.value?.steps,
        name: template?.value?.name,
      }
      setFieldValue('signFlow', getFormatedFlow(template?.value), false)
    }
  }
  const handleSelectDocumentType = (
    selectOpt: TCommonSelectOptions<Pick<DocumentType, 'id' | 'name' | 'shortName'>>
  ) => {
    setFieldValue(
      'notation',
      selectOpt?.value?.name === 'Công văn'
        ? `${user?.currentPosition?.unitShortName ?? ''}`
        : `${selectOpt?.value?.shortName ?? ''}-${user?.currentPosition?.unitShortName ?? ''}`
    )
  }

  const handleFetchAdditionalUnitDirectors = async (
    unitIds: string[] = [],
    newUnitsWithHasViceOnly: string[] = []
  ) => {
    try {
      isLoadingAdditionalDirector.value = true
      const additionalDirectorsOfUnitsRes = await Promise.all(
        unitIds.map((unitId) =>
          sharedUnitService.getUserInUnit({
            unitId
          })
        )
      )
      const combinedUsers = additionalDirectorsOfUnitsRes
        ?.map((response) => response?.items)
        .flat()
        ?.filter(
          (staff) =>
            staff?.positions?.[0]?.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
            staff?.positions?.[0]?.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead
        )
      isLoadingAdditionalDirector.value = false
      const newDirectorList = [
        ...(listDirectorThatIncludeAsViewerRole.value ?? []),
        ...(combinedUsers ?? [])
      ]?.filter((user) => newUnitsWithHasViceOnly?.includes(user?.positions?.[0]?.unitId))
      listDirectorThatIncludeAsViewerRole.value = newDirectorList
    } catch (e) {
      listDirectorThatIncludeAsViewerRole.value = [
        ...(listDirectorThatIncludeAsViewerRole.value ?? [])
      ]?.filter((user) => newUnitsWithHasViceOnly?.includes(user?.positions?.[0]?.unitId))
      toastError({
        detail:
          e instanceof Error
            ? e?.message
            : 'Có lỗi xảy ra khi lấy thông tin danh sách các lãnh đạo đơn vị'
      })
    } finally {
      isLoadingAdditionalDirector.value = false
    }
  }

  watch(
    () => values?.signFlow,
    (signFlow) => {
      if (!signFlow) return
      const listUnitThatNeedIncludeLeaderInDestination =
        getListUnitThatNeedIncludeLeaderInDestination(
          signFlow?.map((flow) => {
            if (
              flow?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
              flow?.signType === OD_SIGN_TYPES.staffUnitSigner ||
              flow?.signType === OD_SIGN_TYPES.leaderCollaborator ||
              flow?.signType === OD_SIGN_TYPES.staffCollaborator
            ) {
              return { ...flow, staffs: flow?.staffs ?? [] }
            }
            return flow
          })
        )

      //unit that need include in destinations here now ok
      const needToFetchDirectorUnitIds = difference(
        listUnitThatNeedIncludeLeaderInDestination,
        listUnitThatHasToIncludeDirectorAsViewerRole.value
      )
      handleFetchAdditionalUnitDirectors(
        needToFetchDirectorUnitIds,
        listUnitThatNeedIncludeLeaderInDestination
      )
      listUnitThatHasToIncludeDirectorAsViewerRole.value =
        listUnitThatNeedIncludeLeaderInDestination
    },
    { deep: true }
  )

  watch(
    [isGetDetailSuccess, detailInternalDoc],
    async ([isGetDetailSuccess, detailInternalDoc]) => {
      try {
        isProcessingForm.value = true

        if (isGetDetailSuccess && detailInternalDoc) {
          const relatedUploadFiles = Array.from(
            detailInternalDoc?.documentFiles?.relatedFiles?.values()
          )?.filter((file) => file?.type === 'UPLOADED') as UploadedFileVM[]
          const relatedDocFiles = Array.from(
            detailInternalDoc?.documentFiles?.relatedFiles?.values()
          )?.filter(
            (file) =>
              file?.type === 'INDOC' || file?.type === 'OUTDOC' || file?.type === 'INTERNAL_DOC'
          ) as InDocumentFileVM[] | OutDocumentFileVM[]
          const relatedWorkFiles = Array.from(
            detailInternalDoc?.documentFiles?.relatedFiles?.values()
          )?.filter((file) => file?.type === 'WORK') as WorkFileVM[]

          const processType = detailInternalDoc?.isEnglish
            ? {
              value: OUT_DOC_PROCESS_TYPES.english,
              label: OUT_DOC_PROCESS_LABEL.ENGLISH
            }
            : detailInternalDoc?.haveNumber
              ? {
                value: OUT_DOC_PROCESS_TYPES.normal,
                label: OUT_DOC_PROCESS_LABEL.NORMAL
              }
              : {
                value: OUT_DOC_PROCESS_TYPES.noNum,
                label: OUT_DOC_PROCESS_LABEL.NO_NUMBER
              }

          const oldFlow = detailInternalDoc?.signFlowVM?.flowStepVMS?.filter((step) => step?.signType !== OD_SIGN_TYPES.creator)?.map((step) => {
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
                  listSigners?.length > 1 && listSigners?.every?.((signer) => signer?.userIndex === 1)
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
                label: detailInternalDoc?.documentType,
                value: {
                  id: detailInternalDoc?.documentTypeId,
                  name: detailInternalDoc?.documentType,
                  shortName: detailInternalDoc?.documentTypeShortName
                }
              },
              dueDate: detailInternalDoc?.dueDate
                ? new Date(detailInternalDoc?.dueDate)
                : undefined,
              urgencyLevel: {
                label: URGENCY_LEVEL_LABELS?.[detailInternalDoc?.priority],
                value: detailInternalDoc?.priority
              },
              subject: detailInternalDoc?.subject,
              description: detailInternalDoc?.description ?? undefined,
              processType: processType,
              creatorSignFile: detailInternalDoc?.signFlowVM?.flowStepVMS?.some(
                (step) => step?.signType === OD_SIGN_TYPES.creator
              ),
              relatedContent: detailInternalDoc?.relatedContent,
              notation:
                user?.currentPosition?.unitName === 'Công văn'
                  ? detailInternalDoc?.documentTypeShortName
                  : `${detailInternalDoc?.documentTypeShortName}-${user?.currentPosition?.unitShortName}`,
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
            }),
            false
          )
          const promiseMainFile = createFileFromUrl(
            getFullFileUrl(detailInternalDoc?.documentFiles?.mainFile),
            getFileName(detailInternalDoc?.documentFiles?.mainFile)
          )
            .then((file) => setFieldValue('mainFile', file))
            .catch(console.log)

          const promiseannexesFiles = Promise.allSettled(
            (detailInternalDoc?.documentFiles?.annexes ?? []).map((p) =>
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
          detail:
            e instanceof Error ? e?.message : 'Có lỗi xảy ra khi lấy thông tin chi tiết văn bản'
        })
      } finally {
        isProcessingForm.value = false
      }
    },
    { immediate: true }
  )

  return {
    values,
    errors,
    isReCreatingDoc,
    handleSubmit,
    destinationsErrorMessage,
    listDirectorThatIncludeAsViewerRoleDestination,
    creatorSignFile,
    listSignTemplate,
    isGettingSignTemplates,
    selectedFlow,
    detailInternalDoc,
    isGettingDocInfo,
    isGetDetailSuccess,
    isProcessingForm,
    error,
    isLoadingAdditionalDirector,
    setValues,
    getListTemplateOpts,
    handleSelectSignTemplate,
    handleFetchAdditionalUnitDirectors,
    handleSelectDocumentType,
    getFormatedFlow,
    genDocumentProcessType,
    reCreateDoc,
    setFieldValue
  }
}
