import { useGetUnitFlow } from '@/shared/composables/queries/organization/flow/useGetUnitFlow'
import { useGetSystemConfig } from '@/shared/composables/queries/system/useGetSystemConfig'
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  DOCUMENT_PROCESS_NUMBER,
  type TDocumentProcess,
  type TDocumentProcessRole,
  type TFormSelectProcessDoc
} from '../constants/document'
import { getDisplayDistributeLabel } from '../utils/document'

export const useFlowInfo = (unitId: string, enabled: MaybeRefOrGetter<boolean>) => {
  const { data: systemConfig, isLoading: isGettingSystemConfigInfo } = useGetSystemConfig({
    enabled: () => toValue(enabled)
  })

  const {
    data: flowData,
    isLoading: isGettingFlow,
    isSuccess: isGetFlowSucess
  } = useGetUnitFlow(() => unitId!, {
    enabled: () => !!unitId && toValue(enabled)
  })

  const availableDistributeRoles: ComputedRef<TDocumentProcess[]> = computed(() => {
    if (
      !systemConfig?.value?.systemRoleConfig ||
      !flowData?.value?.enabledDistributionRoles?.length
    )
      return []
    return Object.entries(systemConfig?.value?.systemRoleConfig)
      .filter(
        ([role, type]) =>
          flowData?.value?.enabledDistributionRoles?.includes(role as TDocumentProcessRole) &&
          type !== 'NONE'
      )
      ?.map(([role, type]) => ({
        role: role as TDocumentProcessRole,
        type: type === DOCUMENT_PROCESS_NUMBER.one ? 'radio' : 'checkbox',
        ...getDisplayDistributeLabel(role as TDocumentProcessRole)
      }))
  })

  const formDistributeInputList: ComputedRef<TFormSelectProcessDoc[]> = computed(() =>
    availableDistributeRoles?.value?.map((availableRole) => ({
      type: availableRole?.type,
      name: availableRole?.role
    }))
  )
  const availableAssignRoles: ComputedRef<TDocumentProcess[]> = computed(() => {
    if (!systemConfig?.value?.systemRoleConfig || !flowData?.value?.enabledAssignmentRoles?.length)
      return []
    return Object.entries(systemConfig?.value?.systemRoleConfig)
      .filter(
        ([role, type]) =>
          flowData?.value?.enabledAssignmentRoles?.includes(role as TDocumentProcessRole) &&
          type !== 'NONE'
      )
      ?.map(([role, type]) => ({
        role: role as TDocumentProcessRole,
        type: type === DOCUMENT_PROCESS_NUMBER.one ? 'radio' : 'checkbox',
        ...getDisplayDistributeLabel(role as TDocumentProcessRole)
      }))
  })

  const formAssignInputList: ComputedRef<TFormSelectProcessDoc[]> = computed(() =>
    availableAssignRoles?.value?.map((availableRole) => ({
      type: availableRole?.type,
      name: availableRole?.role
    }))
  )

  return {
    availableDistributeRoles,
    formDistributeInputList,
    availableAssignRoles,
    formAssignInputList,
    flowData,
    isGettingFlow,
    isGetFlowSucess,
    isGettingSystemConfigInfo
  }
}
