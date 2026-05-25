import { useGetListUnitSignTemplate } from '@/modules/organization/composables/queries/signFlow/useGetListUnitSignTemplate'
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import { useGetHasStampUnits } from '@/shared/composables/queries/organization/unit/useGetHasStampUnits'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import {
  DOCUMENT_PROCESS_ROLES,
  URGENCY_LEVEL_LABELS,
  UrgentLevelsEnum
} from '@/shared/constants/document'
import { ROUTE_PATHS } from '@/shared/constants/router'
import {
  OD_SIGN_TYPES,
  type TODMultipleStaffSignTypes,
  type TODSignleStaffSignTypes
} from '@/shared/constants/sign'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createPaperOutDocSchema } from '../schemas/documentSchema'
import { useCreatePaperOutDoc as useCreatePaperOutDocQuery } from './queries/useCreatePaperOutDoc'
import type { TDocumentSignSteps } from '@/shared/models/outDoc/signer'

export const useCreatePaperOutDoc = (isReRegister: boolean) => {
  const router = useRouter()
  const user = useUserProfileStore().user
  const schema = createPaperOutDocSchema.superRefine((data, ctx) => {
    if (!isReRegister && !data.template) {
      ctx.addIssue({
        code: 'custom',
        message: "Vui lòng chọn mẫu trình tự ký",
        path: ["template"],
      });
    }
  });
  const { values, errors, handleSubmit, setFieldValue, setValues } = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: {
      urgencyLevel: {
        label: URGENCY_LEVEL_LABELS?.NORMAL,
        value: UrgentLevelsEnum.Normal
      },
      relatedFiles: {
        fromDoc: [],
        fromTask: [],
        upload: []
      }
    }
  })

  const { mutate: createDoc, isPending: isCreatingDoc } = useCreatePaperOutDocQuery({
    onSuccess: () => {
      toastSucceed({ detail: 'Đăng ký văn bản đi ký giấy thành công' })
      router.push(ROUTE_PATHS.outDoc.created)
    }
  })

  const { data: hasStampUnits, isLoading: isGettingHasStampUnits } = useGetHasStampUnits()

  const selectedFlow = ref<TDocumentSignSteps>()
  const listUnitThatHasToIncludeDirectorAsViewerRole = ref<string[]>([])

  const listDirectorThatIncludeAsViewerRole = ref<StaffVM[]>([])
  const isLoadingAdditionalDirector = ref<boolean>(false)

  const listDirectorThatIncludeAsViewerRoleDestination = computed(() => {
    const formatedValues = new Map<string, TFormSelectDestinationValue>()
    listDirectorThatIncludeAsViewerRole?.value?.forEach((director) =>
      formatedValues.set(director?.positions?.[0]?.id, {
        ...formatSelectValueForInternalStaffFromStaffData(director),
        formName: DOCUMENT_PROCESS_ROLES.Viewer
      })
    )
    return formatedValues
  })

  const { errorMessage: errorIssueUnit } = useField('issueUnit')

  const {
    data: listSignTemplate,
    isLoading: isGettingSignTemplates,
    isSuccess: isGetListTemplateSuccess
  } = useGetListUnitSignTemplate(() => user?.currentPosition?.unitId!, 'out', {
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

  const handleSelectIssueUnit = (issueUnit: TUnitSelectValue | null) => {
    setFieldValue('issueUnit', issueUnit)
    setFieldValue('destinations', undefined)
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

  watch([listSignTemplate, isGetListTemplateSuccess], ([templates, isSuccess]) => {
    if (isSuccess && templates?.length && !isReRegister) {
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
    hasStampUnits,
    isGettingHasStampUnits,
    listDirectorThatIncludeAsViewerRoleDestination,
    errorIssueUnit,
    listSignTemplate,
    isGettingSignTemplates,
    selectedFlow,
    isLoadingAdditionalDirector,
    getListTemplateOpts,
    handleSelectSignTemplate,
    handleSelectIssueUnit,
    handleFetchAdditionalUnitDirectors,
    getFormatedFlow,
    createDoc,
    setValues,
    setFieldValue
  }
}
