<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { GENDER_OPTIONS } from '@/shared/constants/common'
import {
  APP_PERMISSION_LIST_LABEL,
  APP_PERMISSION_SCOPE_LIST,
  APP_PERMISSION_VALUES,
  type TAppFeatureKey
} from '@/shared/constants/permission'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, handleGetGenderOpts, toastSucceed } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import { useAdminGetAccountDetail } from '../composables/queries/useAdminGetAccountDetail'
import {
  useUpdateAccountInfo,
  type TUpdateAccountPayload
} from '../composables/queries/useUpdateAccountInfo'

import {
  useUpdatePositionInfo,
  type TUpdatePositionPayload
} from '../composables/queries/useUpdatePositionInfo'

import type { AccountDetailVM } from '@/shared/services/api'
import type z from 'zod'
import {
  useUpdateRolesAndPermissonInPosition,
  type TUpdateRoleAndPermissionInRolePayload
} from '../composables/queries/useUpdateRolesAndPermissonInPosition'
import { addtionnalConfigSchema, staffManagementSchema } from '../schemas/staffManagementSchema'
import { fetchRolesOptions, genPermissionsFromRoles } from '../utils/permissions'
import AdditionalPermission from './AdditionalPermission.vue'

const props = defineProps<{
  accountId?: string
  parentUnit?: {
    id: string
    name: string
    rank: number
  }
}>()

const emit = defineEmits<{
  (e: 'updatedStaff'): void
}>()

const user = useUserProfileStore().user
const isHasEditAccountPerm = computed(() => {
  return checkIfUserHasPermission(
    user?.currentPermission ?? [],
    APP_PERMISSION_VALUES.manageAccount
  )
})

const confirm = useConfirm()

const { setValues, handleSubmit, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(staffManagementSchema),
  initialValues: {
    phone: undefined
  }
})

const { value: additionalPermissions, setValue: setAdditionalPermissions } =
  useField<z.infer<typeof addtionnalConfigSchema>>('additionalPermissions')

const {
  data: detailStaffInfo,
  isLoading: isLoadingInfo,
  isSuccess: isGetInfoSuccess
} = useAdminGetAccountDetail(() => props?.accountId!, {
  enabled: () => !!props?.accountId,
  structuralSharing: false
})

const { mutateAsync: updateAccount, isPending: isUpdatingAccount } = useUpdateAccountInfo({
  onSuccess: () =>
    toastSucceed({
      detail: 'Cập nhật thông tin người dùng thành công'
    })
})
const { mutateAsync: updatePosition, isPending: isUpdatingPosition } = useUpdatePositionInfo({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật thông tin chức vụ của người dùng thành công'
    })
  }
})

const {
  mutateAsync: updateRolesAndPermissionInPosition,
  isPending: isUpdatingRolesAndPermissionInPosition
} = useUpdateRolesAndPermissonInPosition({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật quyền và vai trò trong chức vụ người dùng thành công'
    })
  }
})

const currentPosition = computed(() =>
  detailStaffInfo?.value?.positions?.find((pos) => pos?.unitId === props.parentUnit?.id)
)

const handleGetProviders = () => ({
  options: (detailStaffInfo?.value?.signingConfig ?? [])?.map((config) => ({
    label: SIGN_PROVIDER_LABEL?.[config.signingProvider],
    value: config.signingProvider
  })),
  hasMore: false
})

const handleUpdateStaff = async (
  updateAccountPayload: TUpdateAccountPayload,
  updateRolesAndPermissionInPositionPayload: TUpdateRoleAndPermissionInRolePayload,
  updatePositionPayload: TUpdatePositionPayload
) => {
  await Promise.allSettled([
    updateAccount(updateAccountPayload),
    updatePosition(updatePositionPayload),
    updateRolesAndPermissionInPosition(updateRolesAndPermissionInPositionPayload)
  ])
  emit('updatedStaff')
}

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'updateStaff',
    message: 'Thầy/Cô có xác nhận cập nhật nhân sự này?',
    header: 'Cập nhật nhân sự',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'primary'
    },
    accept: () => {
      if (!detailStaffInfo?.value || !currentPosition?.value) return
      const updateAccountPayload: TUpdateAccountPayload = {
        id: detailStaffInfo?.value?.id,
        payload: cleanObject({
          fullName: formValues?.fullName,
          email: formValues?.email,
          phone: formValues?.phone,
          gender: formValues?.gender?.value,
          defaultPositionId: detailStaffInfo?.value?.defaultPositionId!,
          defaultSigningProvider: formValues?.defaultSigningProvider?.value
        })
      }
      const updatePositionPayload: TUpdatePositionPayload = {
        positionId: currentPosition?.value?.id,
        payload: {
          userId: detailStaffInfo?.value?.id,
          unitId: currentPosition?.value?.unitId,
          title: formValues?.positionTitle,
          rank: formValues?.rank ?? 100,
          start: DateTime.fromJSDate(formValues.startDate).toISODate()!,
          end: formValues.endDate ? DateTime.fromJSDate(formValues.endDate).toISODate()! : undefined
        }
      }
      const updateRolesAndPermissionInPositionPayload = {
        positionId: currentPosition?.value?.id,
        payload: {
          roleIds: (values?.roles ?? [])?.map((role) => role?.value?.id),
          rules: (values?.additionalPermissions ?? [])?.map((permissionConfig) => ({
            permission: permissionConfig?.permission?.value?.permission,
            scope: permissionConfig?.scope?.value,
            tenantId: permissionConfig?.unit?.id,
            effect: permissionConfig?.effect!
          }))
        }
      }
      handleUpdateStaff(
        updateAccountPayload,
        updateRolesAndPermissionInPositionPayload,
        updatePositionPayload
      )
    }
  })
})

const handleReset = (detailStaffInfo?: AccountDetailVM, parentUnitId?: string) => {
  console.log(detailStaffInfo, parentUnitId, 'sdfaaaaaaaaafdasfadsfdas')
  if (detailStaffInfo && parentUnitId) {
    const currentPos = detailStaffInfo?.positions?.find(
      (position) => position?.unitId === parentUnitId
    )!
    if (!currentPos) return
    setValues(
      {
        fullName: detailStaffInfo?.fullName,
        phone: detailStaffInfo?.phone ?? undefined,
        email: detailStaffInfo?.username,
        gender: GENDER_OPTIONS?.find((gender) => gender?.value === detailStaffInfo?.gender),
        rank: currentPos?.rank,
        positionTitle: currentPos?.title,
        roles:
          currentPos?.roles?.map((role) => ({
            label: role?.title,
            value: role
          })) ?? [],
        defaultSigningProvider: detailStaffInfo?.defaultSigningConfig
          ? {
              label: SIGN_PROVIDER_LABEL?.[detailStaffInfo?.defaultSigningConfig?.signingProvider],
              value: detailStaffInfo?.defaultSigningConfig?.signingProvider
            }
          : undefined,
        additionalPermissions: currentPosition.value?.additionalPermissions
          ?.sort((a, b) => a?.permission?.localeCompare(b?.permission))
          ?.map((perm) => ({
            permission: {
              label:
                APP_PERMISSION_LIST_LABEL?.[perm.permission as TAppFeatureKey] ?? perm.permission,
              value: {
                permission: perm?.permission as TAppFeatureKey,
                isGlobal: perm?.isGlobal
              }
            },
            effect: perm?.effect,
            unit: perm?.tenant,
            scope: APP_PERMISSION_SCOPE_LIST?.find((scopeOpt) => scopeOpt?.value === perm?.scope)!
          })),
        startDate: currentPosition.value?.start
          ? new Date(currentPosition.value?.start)
          : undefined,
        endDate: currentPosition.value?.end ? new Date(currentPosition.value?.end) : undefined
      },
      false
    )
  }
}

// Watch props to set form data from both treeData and detailStaffInfo
watch(
  [isGetInfoSuccess, detailStaffInfo, () => props.parentUnit?.id],
  ([isSuccess, detailInfo, parentUnitId]) => {
    if (isSuccess) handleReset(detailInfo, parentUnitId)
  },
  { deep: true }
)
</script>

<template>
  <div class="flex h-full w-full flex-col shadow-[0px_12px_24px_-4px_#919EAB33]">
    <div class="flex flex-col">
      <div class="bg-primary h-10 px-4 py-2 text-white">
        <h2 class="text-lg font-semibold">Chỉnh sửa nhân sự</h2>
      </div>
      <div class="relative flex-1 overflow-auto p-4">
        <div
          v-if="isLoadingInfo"
          class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center"
        >
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
        <form @submit="onSubmit">
          <div class="grid grid-cols-2 gap-4">
            <AppTextInput
              :disabled="!isHasEditAccountPerm"
              name="fullName"
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              required
            />

            <AppTextInput
              :disabled="!isHasEditAccountPerm"
              name="phone"
              label="SĐT"
              placeholder="Nhập số điện thoại"
            />

            <AppSelect
              :disabled="!isHasEditAccountPerm"
              name="gender"
              label="Giới tính"
              placeholder="Vui lòng chọn"
              :fetchOptions="handleGetGenderOpts"
              :isFetchOnInit="true"
            />

            <AppTextInput name="email" disabled label="Email" required placeholder="Nhập email" />

            <AppTextInput
              :disabled="!isHasEditAccountPerm"
              name="positionTitle"
              label="Chức vụ"
              required
              placeholder="Nhập chức vụ"
            />
            <AppNumberInput
              :disabled="!isHasEditAccountPerm"
              name="rank"
              required
              label="STT"
              placeholder="Nhập số thứ tự"
            />

            <AppDateInput
              :disabled="!isHasEditAccountPerm"
              name="startDate"
              label="Ngày bắt đầu nhiệm kỳ"
              date-format="dd/mm/yy"
              required
              placeholder="Chọn ngày"
            />
            <AppDateInput
              :disabled="!isHasEditAccountPerm"
              name="endDate"
              label="Ngày kết thúc"
              date-format="dd/mm/yy"
              placeholder="Chọn ngày"
            />
            <AppSelect
              :disabled="!isHasEditAccountPerm"
              name="roles"
              label="Vai trò"
              placeholder="Chọn vai trò"
              multiple
              :fetch-options="fetchRolesOptions"
            />
            <AppSelect
              :disabled="!isHasEditAccountPerm"
              name="defaultSigningProvider"
              label="Cài đặt cấu hình ký mặc định"
              placeholder="Chọn loại ký"
              :fetchOptions="handleGetProviders"
              :isFetchOnInit="true"
            />
            <AdditionalPermission
              :disabled="!isHasEditAccountPerm"
              class="col-span-2"
              :model-value="additionalPermissions"
              @submit="(submitValues) => setFieldValue('additionalPermissions', submitValues)"
              :generatedPermissionsFromRoles="genPermissionsFromRoles(values?.roles ?? [])"
            />
          </div>
          <div
            class="mt-4 flex min-w-[100px] items-center justify-end gap-4"
            v-if="isHasEditAccountPerm"
          >
            <Button
              variant="outlined"
              severity="secondary"
              :disabled="
                isUpdatingAccount || isUpdatingPosition || isUpdatingRolesAndPermissionInPosition
              "
              @click="handleReset(detailStaffInfo, props.parentUnit?.id)"
              label="Đặt lại"
            ></Button>
            <Button
              type="submit"
              :loading="
                isUpdatingAccount || isUpdatingPosition || isUpdatingRolesAndPermissionInPosition
              "
              label="Cập nhật"
            ></Button>
          </div>
        </form>
      </div>
    </div>
    <ConfirmDialog group="updateStaff" />
  </div>
</template>
