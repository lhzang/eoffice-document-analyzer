<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import {
  APP_PERMISSION_LIST_LABEL,
  APP_PERMISSION_SCOPE_LIST,
  type TAppFeatureKey
} from '@/shared/constants/permission'
import type { AccountDetailVM, PositionVM } from '@/shared/services/api'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import type z from 'zod'
import { useDeletePosition } from '../composables/queries/useDeletePosition'
import {
  useUpdatePositionInfo,
  type TUpdatePositionPayload
} from '../composables/queries/useUpdatePositionInfo'
import {
  useUpdateRolesAndPermissonInPosition,
  type TUpdateRoleAndPermissionInRolePayload
} from '../composables/queries/useUpdateRolesAndPermissonInPosition'
import { addtionnalConfigSchema, staffPositionSchema } from '../schemas/staffManagementSchema'
import { fetchRolesOptions, genPermissionsFromRoles } from '../utils/permissions'
import AdditionalPermission from './AdditionalPermission.vue'

type TProps = {
  position: PositionVM
  staffDetail: AccountDetailVM
  hasUpdatePositionPermissionUnitIds: string[]
  hasDeletePositionPermissionUnitIds: string[]
}
const props = defineProps<TProps>()

const hasUpdatePermission = computed(() =>
  props.hasUpdatePositionPermissionUnitIds?.some((id) => id === props.position.unitId)
)

const hasDeletePermission = computed(() =>
  props.hasDeletePositionPermissionUnitIds?.some((id) => id === props.position.unitId)
)

const emit = defineEmits<{
  (e: 'processedPosition'): void
}>()

const confirm = useConfirm()

const { values, errors, setFieldValue, resetForm, handleSubmit } = useForm({
  validationSchema: toTypedSchema(staffPositionSchema)
})

const { value: additionalPermissions, setValue: setAdditionalPermissions } =
  useField<z.infer<typeof addtionnalConfigSchema>>('additionalPermissions')

const { mutate: deletePosition, isPending: isDeletingPosition } = useDeletePosition({
  onSuccess: () => {
    toastSucceed({
      detail: 'Xoá chức vụ người dùng thành công'
    })
    emit('processedPosition')
  }
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

const handleUpdateStaff = async (
  updateRolesAndPermissionInPositionPayload: TUpdateRoleAndPermissionInRolePayload,
  updatePositionPayload: TUpdatePositionPayload
) => {
  await Promise.allSettled([
    updatePosition(updatePositionPayload),
    updateRolesAndPermissionInPosition(updateRolesAndPermissionInPositionPayload)
  ])
  emit('processedPosition')
}

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    message: 'Thầy/Cô có xác nhận cập nhật chức vụ này?',
    header: 'Cập nhật chức vụ',
    group: `delete_${props.position.id}`,
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
      const { position, staffDetail } = props
      if (!position) return
      const updatePositionPayload: TUpdatePositionPayload = {
        positionId: position.id,
        payload: {
          userId: staffDetail?.id,
          unitId: position.unitId,
          title: formValues?.positionTitle,
          rank: formValues?.rank ?? 100,
          start: DateTime.fromJSDate(formValues.startDate).toISODate()!,
          end: formValues.endDate ? DateTime.fromJSDate(formValues.endDate).toISODate()! : undefined
        }
      }
      const updateRolesAndPermissionInPositionPayload = {
        positionId: position.id,
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
      handleUpdateStaff(updateRolesAndPermissionInPositionPayload, updatePositionPayload)
    }
  })
})

const handleDeletePosition = () => {
  confirm.require({
    message: 'Thầy/Cô có xác nhận xoá chức vụ này?',
    group: `delete_${props.position.id}`,
    header: 'Xoá chức vụ',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      deletePosition(props?.position?.id)
    }
  })
}

const handleReset = (position: PositionVM) => {
  resetForm({
    values: {
      unit: {
        id: position?.unitId,
        name: position?.unitName
      },
      positionTitle: position?.title,
      startDate: position?.start ? new Date(position?.start) : undefined,
      endDate: position?.end ? new Date(position?.end) : undefined,
      rank: position?.rank,
      roles:
        position?.roles?.map((role) => ({
          label: role?.title,
          value: role
        })) ?? [],

      additionalPermissions: position?.additionalPermissions
        ?.slice()
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
        }))
    }
  })
}

watch(
  () => props.position,
  (position) => {
    handleReset(position)
  },
  { immediate: true, deep: true }
)
</script>
<template>
  <div class="card">
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <InternalUnitSelect
          modal-label="Chọn đơn vị"
          label="Đơn vị"
          :required="true"
          type="FULL"
          :disabled="!hasUpdatePermission"
          :is-select-multiple="false"
          :model-value="
            props?.position
              ? {
                  id: position?.unitId,
                  name: position?.unitName
                }
              : null
          "
          :error-message="errors.unit"
          @submit="(value) => setFieldValue('unit', value)"
        />
        <AppTextInput
          :disabled="!hasUpdatePermission"
          name="positionTitle"
          label="Chức vụ"
          required
          placeholder="Nhập chức vụ"
        />
        <AppNumberInput
          :disabled="!hasUpdatePermission"
          name="rank"
          required
          label="STT"
          placeholder="Nhập số thứ tự"
        />
        <AppDateInput
          :disabled="!hasUpdatePermission"
          name="startDate"
          label="Ngày bắt đầu nhiệm kỳ"
          date-format="dd/mm/yy"
          required
          placeholder="Chọn ngày"
        />
        <AppDateInput
          :disabled="!hasUpdatePermission"
          name="endDate"
          label="Ngày kết thúc"
          date-format="dd/mm/yy"
          placeholder="Chọn ngày"
        />
        <AppSelect
          :disabled="!hasUpdatePermission"
          name="roles"
          label="Vai trò"
          placeholder="Chọn vai trò"
          multiple
          :fetch-options="fetchRolesOptions"
        />
        <AdditionalPermission
          :disabled="!hasUpdatePermission"
          class="col-span-2"
          :model-value="additionalPermissions"
          @submit="(submitValues) => setFieldValue('additionalPermissions', submitValues)"
          :generatedPermissionsFromRoles="genPermissionsFromRoles(values?.roles ?? [])"
        />
      </div>
      <div class="mt-6 flex items-center justify-end gap-4">
        <Button
          :disabled="
            isUpdatingPosition || isUpdatingRolesAndPermissionInPosition || !hasDeletePermission
          "
          @click="handleReset(props.position)"
          label="Đặt lại"
          severity="secondary"
          variant="outlined"
        />
        <Button
          :loading="isDeletingPosition"
          :disabled="
            isUpdatingPosition || isUpdatingRolesAndPermissionInPosition || !hasDeletePermission
          "
          @click="handleDeletePosition"
          label="Xóa"
          severity="danger"
        />
        <Button
          :loading="isUpdatingPosition || isUpdatingRolesAndPermissionInPosition"
          :disabled="isDeletingPosition || !hasUpdatePermission"
          type="submit"
          label="Cập nhật"
          severity="primary"
        />
      </div>
    </form>
    <ConfirmDialog :group="`delete_${props.position.id}`" />
  </div>
</template>
