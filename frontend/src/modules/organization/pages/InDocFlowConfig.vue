<script setup lang="ts">
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useGetPermissionsInUnit } from '@/shared/composables/queries/accessControl/useGetPermissionsInUnit'
import { useGetUnitFlow } from '@/shared/composables/queries/organization/flow/useGetUnitFlow'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import {
  type TTreeUnitWithStaffNode,
  type TUnitSelectValue
} from '@/shared/models/organization/unit'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import FlowAssignConfig from '../components/FlowAssignConfig.vue'
import FlowDistributeConfig from '../components/FlowDistributeConfig.vue'
import FlowOrderConfig from '../components/FlowOrderConfig.vue'
import { useUpdateUnitFlow } from '../composables/queries/useUpdateUnitFlow'
import { DISTRIBUTE_TYPE, FLOW_OBJECT, SCOPE, SCOPE_LIST } from '../constants/flow'
import { flowConfigSchema } from '../schemas/flowSchemas'

const selectedUnit = ref<TUnitSelectValue | null>(null)
const currentUnitId = useUserProfileStore()?.user?.currentPosition?.unitId
const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isSuccess: isGetHasRoleUnitsSuccess,
  isError: isGetHasRoleUnisError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.viewIndocFlow)

const {
  data: flowData,
  isLoading: isGettingFlow,
  isSuccess: isGetFlowSucess,
  error: getFlowError
} = useGetUnitFlow(() => selectedUnit?.value?.id!, {
  enabled: () => !!selectedUnit?.value?.id
})

const { data: permissionInUnit, isLoading: isGettingPermission } = useGetPermissionsInUnit(
  () => selectedUnit?.value?.id!,
  {
    enabled: () => !!selectedUnit?.value?.id,
    structuralSharing: false
  }
)

const isHasUpdatePermission = computed(() => {
  return (
    permissionInUnit?.value &&
    permissionInUnit?.value?.includes(APP_PERMISSION_VALUES.updateIndocFlow)
  )
})

const { mutate: updateFlow, isPending: isUpdatingFlow } = useUpdateUnitFlow({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật luồng đơn vị thành công'
    })
    reset()
  }
})
const filterDisableUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    isGetHasRoleUnisError.value ||
    isGetttingHasRoleUnits.value ||
    !hasRoleUnits?.value?.some((hasRoleUnit) => hasRoleUnit?.id === unit?.id)
  )
    return true
  return false
}
const { handleSubmit, handleReset, setValues, values } = useForm({
  validationSchema: toTypedSchema(flowConfigSchema),
  initialValues: {
    enablePropose: false,
    paperCreators: [],
    internetReceivers: [],
    assignedUnits: [],
    receivedUnits: [],
    enabledAssignmentRoles: [],
    enabledDistributionRoles: []
  },
  validateOnMount: false
})

const reset = () => {
  handleReset()
  selectedUnit.value = null
}

const handleCancel = () => {
  reset()
}
const handleSelectConfigUnit = (value: TUnitSelectValue | null) => {
  selectedUnit.value = value
}
const onSubmit = handleSubmit((values) => {
  if (!selectedUnit?.value) return

  const baseValue = {
    unitId: selectedUnit?.value?.id,
    isParallel: values?.isParallel,
    distributeMode: values?.isDistributeMultipleTime
      ? DISTRIBUTE_TYPE.MULTIPLE
      : DISTRIBUTE_TYPE.SINGLE,
    enablePropose: values?.enablePropose,
    paperCreators: (values?.paperCreators ?? [])?.map((staff) => staff?.positionId),
    internetReceivers: (values?.internetReceivers ?? [])?.map((staff) => staff?.positionId),
    distributionReceivers: [
      ...(values?.receivers ?? [])?.map((unit) => ({
        unitId: unit?.id,
        type: FLOW_OBJECT.STAFF,
        scope: SCOPE.SELF
      })),
      ...(values?.receivedUnits ?? [])?.map((unitOpt) => ({
        unitId: unitOpt?.unit?.id!,
        type: FLOW_OBJECT.UNIT,
        scope: unitOpt?.scope?.value
      }))
    ],
    assignmentReceivers: [
      ...(values?.assignees ?? [])?.map((unit) => ({
        unitId: unit?.id,
        type: FLOW_OBJECT.STAFF,
        scope: SCOPE.SELF
      })),
      ...(values?.assignedUnits ?? [])?.map((unitOpt) => ({
        unitId: unitOpt?.unit?.id!,
        type: FLOW_OBJECT.UNIT,
        scope: unitOpt?.scope?.value
      }))
    ],
    enabledAssignmentRoles: values?.enabledAssignmentRoles,
    enabledDistributionRoles: values?.enabledDistributionRoles
  }
  if (values?.enablePropose) {
    const payloadPropose = {
      ...baseValue,
      proposers: (values?.proposeRequesters ?? [])?.map((staff) => staff?.positionId),
      distributors: (values?.proposeApprovers ?? [])?.map((staff) => staff?.positionId)
    }
    updateFlow(payloadPropose)
  } else {
    const payloadDistribute = {
      ...baseValue,
      proposers: [],
      distributors: (values?.distributors ?? [])?.map((staff) => staff?.positionId)
    }
    updateFlow(payloadDistribute)
  }
})

watch([isGetHasRoleUnitsSuccess, hasRoleUnits], ([isGetHasRoleUnitsSuccess, hasRoleUnits]) => {
  if (!isGetHasRoleUnitsSuccess || !hasRoleUnits?.length) return
  if (hasRoleUnits?.length === 1) selectedUnit.value = hasRoleUnits?.[0]!
  else {
    const sameCurrentUnit = hasRoleUnits?.find((unit) => unit?.id === currentUnitId)
    if (sameCurrentUnit) selectedUnit.value = sameCurrentUnit
    else selectedUnit.value = hasRoleUnits?.[0]!
  }
})

watch([isGetFlowSucess, flowData], ([isGetFlowSucess, flowDataValue]) => {
  if (isGetFlowSucess && flowDataValue) {
    const paperCreators = flowDataValue?.paperCreators?.map((staff) => ({
      positionId: staff?.id,
      displayName: staff?.name
    }))
    const internetReceivers = flowDataValue?.internetReceivers?.map((staff) => ({
      positionId: staff?.id,
      displayName: staff?.name
    }))
    const proposeRequesters = flowDataValue?.proposers?.map((staff) => ({
      positionId: staff?.id,
      displayName: staff?.name
    }))
    const distributors = flowDataValue?.distributors?.map((staff) => ({
      positionId: staff?.id,
      displayName: staff?.name
    }))

    const receivers = flowDataValue?.distributionStaffReceivers?.map((unit) => ({
      id: unit?.unitId,
      name: unit?.unitName
    }))
    const assignees = flowDataValue?.assignmentStaffReceivers?.map((unit) => ({
      id: unit?.unitId,
      name: unit?.unitName
    }))
    const receivedUnits = flowDataValue?.distributionUnitReceivers?.map((unitOpt) => ({
      unit: {
        id: unitOpt?.unitId,
        name: unitOpt?.unitName
      },
      scope: SCOPE_LIST?.find((scope) => scope?.value === unitOpt.scope)!
    }))
    const assignedUnits = flowDataValue?.assignmentUnitReceivers?.map((unitOpt) => ({
      unit: {
        id: unitOpt?.unitId,
        name: unitOpt?.unitName
      },
      scope: SCOPE_LIST?.find((scope) => scope?.value === unitOpt.scope)!
    }))

    setValues(
      flowDataValue?.enablePropose
        ? {
            isParallel: flowDataValue?.isParallel,
            isDistributeMultipleTime:
              flowDataValue?.distributeMode === DISTRIBUTE_TYPE.MULTIPLE ? true : false,
            enablePropose: true,
            paperCreators: paperCreators,
            internetReceivers: internetReceivers,
            receivers: receivers,
            assignees: assignees,
            receivedUnits: receivedUnits,
            assignedUnits: assignedUnits,
            proposeRequesters: proposeRequesters,
            proposeApprovers: distributors,
            enabledAssignmentRoles: flowDataValue?.enabledAssignmentRoles,
            enabledDistributionRoles: flowDataValue?.enabledDistributionRoles
          }
        : {
            isParallel: flowDataValue?.isParallel,
            isDistributeMultipleTime:
              flowDataValue?.distributeMode === DISTRIBUTE_TYPE.MULTIPLE ? true : false,
            enablePropose: false,
            paperCreators: paperCreators,
            internetReceivers: internetReceivers,
            receivers: receivers,
            assignees: assignees,
            receivedUnits: receivedUnits,
            assignedUnits: assignedUnits,
            distributors: distributors,
            enabledAssignmentRoles: flowDataValue?.enabledAssignmentRoles,
            enabledDistributionRoles: flowDataValue?.enabledDistributionRoles
          }
    )
  }
})
</script>
<template>
  <form @submit="onSubmit">
    <!-- unit select -->
    <div class="border-primary mb-4 rounded-xl border p-4">
      <InternalUnitSelect
        :key="selectedUnit?.id"
        type="FULL"
        :model-value="selectedUnit"
        class="mb-4"
        label="Đơn vị"
        :is-select-multiple="false"
        @submit="handleSelectConfigUnit"
        :check-if-unit-disabled="filterDisableUnit"
        :disabled="isGetttingHasRoleUnits"
      />
    </div>
    <!-- end unit select -->
    <div v-if="isGettingFlow" class="flex h-full items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="getFlowError" class="flex h-full items-center justify-center">
      <span class="text-xl">{{
        getFlowError?.response?.data?.detail ??
        getFlowError?.message ??
        'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
      }}</span>
    </div>
    <div v-else-if="flowData" class="flex flex-col gap-4">
      <div v-if="isGettingFlow" class="mt-10 flex h-[200px] items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <template v-else>
        <div class="card">
          <FlowOrderConfig
            :disabled="!isHasUpdatePermission || isGettingPermission"
            :flowData="flowData"
          />
        </div>
        <div class="card">
          <FlowDistributeConfig
            :disabled="!isHasUpdatePermission || isGettingPermission"
            :flowData="flowData"
          />
        </div>
        <div class="card">
          <FlowAssignConfig
            :disabled="!isHasUpdatePermission || isGettingPermission"
            :flowData="flowData"
          />
        </div>
        <div
          v-if="isHasUpdatePermission && !isGettingPermission"
          class="col-span-full flex justify-end gap-4"
        >
          <Button
            type="button"
            class="w-fit"
            severity="secondary"
            variant="outlined"
            @click="handleCancel"
            :disabled="isUpdatingFlow"
            >Huỷ</Button
          >
          <Button type="submit" :loading="isUpdatingFlow" class="w-fit">Xác nhận</Button>
        </div>
      </template>
    </div>
  </form>
</template>
