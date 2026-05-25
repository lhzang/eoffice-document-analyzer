<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { useGetPermissionsInUnit } from '@/shared/composables/queries/accessControl/useGetPermissionsInUnit'
import { APP_PERMISSION_VALUES, type TAppFeatureKey } from '@/shared/constants/permission'
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '@/shared/models/organization/unit'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { Button, type ColumnProps } from 'primevue'
import { computed, ref } from 'vue'
import { useGetStaffsWithRegisterAndApproveCarInUnitPermission } from '../composables/queries/carDelagation/useGetStaffsWithRegisterAndApproveCarInUnitPermission'
import { APPROVE_AND_REGISTER_PERMISSIONS } from '../constants/carDelagation'
import { CAR_TYPES } from '../constants/carType'
import type {
  TCarConfigRegisterAndApprovePermissions,
  TCarGlobalApproveAndRegister,
  TCarPermissionUser
} from '../models/carDelagation'
import ModalConfigApproveAndRegisterOrgCar from './ModalConfigApproveAndRegisterOrgCar.vue'
import ModalConfigApproveAndRegisterUnitCar from './ModalConfigApproveAndRegisterUnitCar.vue'

type TModalConfigApproveAndRegisterOrgCar = InstanceType<typeof ModalConfigApproveAndRegisterOrgCar>

const configApproveAndRegisterCarRef = ref<TModalConfigApproveAndRegisterOrgCar | null>(null)
const unitId = ref<string | null>(null)
const handleSubmit = (submitValue: TUnitSelectValue | null) => {
  unitId.value = submitValue ? submitValue?.id : null
}

const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.grantEvaluateAndRegisterUnitCar)

const { data, isLoading, refetch } = useGetStaffsWithRegisterAndApproveCarInUnitPermission(
  () => unitId.value!,
  { enabled: () => !!unitId.value }
)

const {
  data: permissionInUnit,
  isLoading: isGettingPermission,
  isError: isErrorWhenGetPerm
} = useGetPermissionsInUnit(() => unitId.value!, {
  enabled: () => !!unitId.value
})

const formatedData = computed(() => {
  const groupedStaffByCarPerm: Record<TCarGlobalApproveAndRegister, TCarPermissionUser[]> = {
    [APPROVE_AND_REGISTER_PERMISSIONS.approveStaff]: [],
    [APPROVE_AND_REGISTER_PERMISSIONS.approveGuest]: [],
    [APPROVE_AND_REGISTER_PERMISSIONS.registerStudent]: [],
    [APPROVE_AND_REGISTER_PERMISSIONS.registerUni]: [],
    [APPROVE_AND_REGISTER_PERMISSIONS.registerCollaborator]: []
  }

  data?.value?.forEach((staff) => {
    if (staff?.carType === CAR_TYPES.staff)
      groupedStaffByCarPerm[APPROVE_AND_REGISTER_PERMISSIONS.approveStaff].push({
        positionId: staff?.staffId,
        displayName: staff?.staffName
      })
    if (staff?.carType === CAR_TYPES.guest)
      groupedStaffByCarPerm[APPROVE_AND_REGISTER_PERMISSIONS.approveGuest].push({
        positionId: staff?.staffId,
        displayName: staff?.staffName
      })
    if (staff?.carType === CAR_TYPES.student)
      groupedStaffByCarPerm[APPROVE_AND_REGISTER_PERMISSIONS.registerStudent].push({
        positionId: staff?.staffId,
        displayName: staff?.staffName
      })
    if (staff?.carType === CAR_TYPES.university)
      groupedStaffByCarPerm[APPROVE_AND_REGISTER_PERMISSIONS.registerUni].push({
        positionId: staff?.staffId,
        displayName: staff?.staffName
      })
    if (staff?.carType === CAR_TYPES.collaborator)
      groupedStaffByCarPerm[APPROVE_AND_REGISTER_PERMISSIONS.registerCollaborator].push({
        positionId: staff?.staffId,
        displayName: staff?.staffName
      })
  })
  const tableData: TCarConfigRegisterAndApprovePermissions[] = [
    {
      permission: {
        label: 'Duyệt xe cán bộ',
        value: APPROVE_AND_REGISTER_PERMISSIONS.approveStaff
      },
      users: groupedStaffByCarPerm.APPROVE_STAFF,
      hasPermission: checkIfUserHasPermission(
        (permissionInUnit?.value as TAppFeatureKey[]) ?? [],
        APP_PERMISSION_VALUES?.grantStaffCar
      )
    },
    {
      permission: {
        label: 'Duyệt xe khách',
        value: APPROVE_AND_REGISTER_PERMISSIONS.approveGuest
      },
      users: groupedStaffByCarPerm.APPROVE_GUEST,
      hasPermission: checkIfUserHasPermission(
        (permissionInUnit?.value as TAppFeatureKey[]) ?? [],
        APP_PERMISSION_VALUES?.grantGuestCar
      )
    },
    {
      permission: {
        label: 'Đăng ký xe người học',
        value: APPROVE_AND_REGISTER_PERMISSIONS.registerStudent
      },
      users: groupedStaffByCarPerm.REGISTER_STUDENT,
      hasPermission: checkIfUserHasPermission(
        (permissionInUnit?.value as TAppFeatureKey[]) ?? [],
        APP_PERMISSION_VALUES?.grantStudentCar
      )
    },
    {
      permission: {
        label: 'Đăng ký xe đại học',
        value: APPROVE_AND_REGISTER_PERMISSIONS.registerUni
      },
      users: groupedStaffByCarPerm.REGISTER_UNIVERSITY,
      hasPermission: checkIfUserHasPermission(
        (permissionInUnit?.value as TAppFeatureKey[]) ?? [],
        APP_PERMISSION_VALUES?.grantUniCar
      )
    },

    {
      permission: {
        label: 'Đăng ký xe thỉnh giảng/CTV',
        value: APPROVE_AND_REGISTER_PERMISSIONS.registerCollaborator
      },
      users: groupedStaffByCarPerm.REGISTER_COLLABORATOR,
      hasPermission: checkIfUserHasPermission(
        (permissionInUnit?.value as TAppFeatureKey[]) ?? [],
        APP_PERMISSION_VALUES?.grantCollaboratorCar
      )
    }
  ]
  return tableData
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: TCarConfigRegisterAndApprovePermissions) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  {
    header: 'Quyền thực hiện',
    field: (permission) => permission?.permission?.label
  },
  {
    header: 'Cán bộ thực hiện',
    field: (permission) => permission?.users?.map((user) => user?.displayName)?.join(', ')
  },
  {
    header: 'Hành động',
    field: 'action',
    customSlot: 'tableAction',
    style: {
      whiteSpace: 'nowrap',
      width: '1%'
    }
  }
]

const filterDisableUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    isError.value ||
    isGetttingHasRoleUnits.value ||
    !hasRoleUnits?.value?.some((hasRoleUnit) => hasRoleUnit?.id === unit?.id)
  )
    return true
  return false
}
</script>
<template>
  <div>
    <div class="border-primary mb-4 rounded-xl border p-4">
      <InternalUnitSelect
        :default-value="null"
        label="Chọn đơn vị"
        modalLabel="Chọn đơn vị"
        :is-select-multiple="false"
        type="FULL"
        @submit="handleSubmit"
        :checkIfUnitDisabled="filterDisableUnit"
      />
    </div>
    <div v-if="unitId">
      <div v-if="isGettingPermission" class="mt-10 flex h-50 items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div v-else-if="isErrorWhenGetPerm" class="mt-10 flex h-50 items-center justify-center">
        <div class="text-primary text-justify text-xl">
          Đã có lỗi khi kiểm tra quyền với đơn vị. Vui lòng thử lại sau
        </div>
      </div>
      <AppTable
        v-else
        class="mt-10"
        :data="formatedData?.filter((data) => data?.hasPermission) ?? []"
        :columns="columns"
        :loading="isLoading"
        :always-show-paginator="false"
        :lazy="false"
      >
        <template #order="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template #tableAction="{ data }">
          <div class="flex justify-center justify-end">
            <Button
              @click="configApproveAndRegisterCarRef?.openModal(data?.permission?.value, unitId)"
              severity="primary"
              class="my-auto p-2!"
            >
              <span class="icon-[mingcute--pencil-3-fill]"></span>
            </Button>
          </div> </template
      ></AppTable>
      <ModalConfigApproveAndRegisterUnitCar
        ref="configApproveAndRegisterCarRef"
        :registerAndApproveStaffsData="formatedData"
        @updated-config="refetch"
      />
    </div>
  </div>
</template>
