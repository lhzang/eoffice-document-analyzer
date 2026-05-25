import { useGetListUnitSignTemplate } from '@/modules/organization/composables/queries/signFlow/useGetListUnitSignTemplate'
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import {
  DOCUMENT_PROCESS_ROLES,
  URGENCY_LEVEL_LABELS,
  UrgentLevelsEnum
} from '@/shared/constants/document'
import { ROUTE_PATHS } from '@/shared/constants/router'
import type { DocumentType } from '@/shared/services/api'

import {
  OD_SIGN_TYPES,
  type TODMultipleStaffSignTypes,
  type TODSignleStaffSignTypes
} from '@/shared/constants/sign'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'

import type { TDocumentSignSteps } from '@/shared/models/outDoc/signer'
import type { StaffVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastError, toastSucceed } from '@/shared/utils/common'
import {
  formatSelectValueForInternalStaffFromStaffData,
  getListUnitThatNeedIncludeLeaderInDestination
} from '@/shared/utils/outDoc/destination'
import { toTypedSchema } from '@vee-validate/zod'
import { difference } from 'lodash-es'
import { useField, useForm } from 'vee-validate'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { INTERNAL_DOC_PROCESS_TYPES_LIST } from '../constants/documents'
import { createInternalDocSchema } from '../schemas/documentSchema'
import { useCreateInternalDoc as useCreateInternalDocQuery } from './queries/useCreateInternalDoc'

export const useCreateInternalDoc = () => {
  const router = useRouter()
  const user = useUserProfileStore().user

  const selectedFlow = ref<TDocumentSignSteps>()
  const listUnitThatHasToIncludeDirectorAsViewerRole = ref<string[]>([])

  const { mutate: createDoc, isPending: isCreatingDoc } = useCreateInternalDocQuery({
    onSuccess: () => {
      toastSucceed({ detail: 'Đăng ký văn bản nội bộ thành công' })
      router.push(ROUTE_PATHS.internalDoc.created)
    }
  })

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

  const { values, errors, handleSubmit, setFieldValue, setValues, submitCount, setFieldError } = useForm({
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
  watchEffect(() => {
    console.log(errors.value, 'dddddddddddddddddddddddd')
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
      selectedFlow.value = template?.value
      setFieldValue('signFlow', getFormatedFlow(template?.value), false)
    }
  }
  const handleSelectDocumentType = (
    selectOpt: TCommonSelectOptions<Pick<DocumentType, 'id' | 'name' | 'shortName'>>
  ) => {
    const docTypeValue = selectOpt?.value as DocumentType | undefined
    setFieldValue(
      'notation',
      docTypeValue?.name === 'Công văn'
        ? `${user?.currentPosition?.unitShortName ?? ''}`
        : `${docTypeValue?.shortName ?? ''}-${user?.currentPosition?.unitShortName ?? ''}`
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
      ]?.filter((user) => newUnitsWithHasViceOnly?.includes(user?.positions?.[0]?.unitId ?? ''))
      listDirectorThatIncludeAsViewerRole.value = newDirectorList
    } catch (e) {
      listDirectorThatIncludeAsViewerRole.value = [
        ...(listDirectorThatIncludeAsViewerRole.value ?? [])
      ]?.filter((user) => newUnitsWithHasViceOnly?.includes(user?.positions?.[0]?.unitId ?? ''))
      toastError({
        detail:
          e instanceof Error
            ? e.message
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
      setFieldError('destinations', undefined)
    },
    { deep: true }
  )

  watch([listSignTemplate, isGetListTemplateSuccess], ([templates, isSuccess]) => {
    if (isSuccess && templates?.length) {
      setFieldValue('template', {
        label: templates?.[0]?.name,
        value: templates?.[0]
      })
      if (listSignTemplate?.value?.[0])
        setFieldValue('signFlow', getFormatedFlow(listSignTemplate?.value?.[0]), false)
    }
  })

  return {
    values,
    errors,
    isCreatingDoc,
    handleSubmit,
    destinationsErrorMessage,
    listDirectorThatIncludeAsViewerRoleDestination,
    creatorSignFile,
    listSignTemplate,
    isGettingSignTemplates,
    selectedFlow,
    isLoadingAdditionalDirector,
    setValues,
    getListTemplateOpts,
    handleSelectSignTemplate,
    handleFetchAdditionalUnitDirectors,
    handleSelectDocumentType,
    getFormatedFlow,
    genDocumentProcessType,
    createDoc,
    setFieldValue
  }
}
