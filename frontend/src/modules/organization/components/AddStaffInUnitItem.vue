<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type { StaffVM } from '@/shared/services/api'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, Divider, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { useCreatePosition } from '../composables/queries/useCreatePosition'
import { useUpdateRolesAndPermissonInPosition } from '../composables/queries/useUpdateRolesAndPermissonInPosition'
import { addStaffPositionIntoUnitSchema } from '../schemas/staffManagementSchema'
import { fetchRolesOptions, genPermissionsFromRoles } from '../utils/permissions'
import AdditionalPermission from './AdditionalPermission.vue'

type TProps = {
  staff: StaffVM
  editingStaffId?: string
  parentUnitId: string
  unitTreeData: TTreeUnitWithStaffNode
}

const emit = defineEmits<{
  (e: 'addedUser'): void
  (e: 'staffClick', staff: StaffVM): void
}>()

const { staff, editingStaffId, unitTreeData } = defineProps<TProps>()

const { handleSubmit, values, setFieldValue, errors } = useForm({
  validationSchema: toTypedSchema(addStaffPositionIntoUnitSchema),
  initialValues: {
    unit: {
      id: unitTreeData?.id,
      name: unitTreeData?.name
    }
  }
})

const confirm = useConfirm()

const handleUpdateRolesAndPosition = async (id: string) => {
  const updateRolesAndPermissionInPositionPayload = {
    positionId: id,
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
  updateRolesAndPermissionInPosition(updateRolesAndPermissionInPositionPayload)
}

const { mutate: createdPosition, isPending: isCreating } = useCreatePosition({
  onSuccess: (id) => {
    // isVisible.value = false
    // emit('createdPosition')
    toastSucceed({
      detail: 'Thêm chức vị cho người dùng thành công'
    })
    handleUpdateRolesAndPosition(id)
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
    emit('addedUser')
  }
})

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    message: 'Thầy/Cô có xác nhận thêm chức vụ này?',
    header: 'Thêm chức vụ',
    group: 'createPosition',
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
      if (!formValues?.unit) return
      createdPosition(
        cleanObject({
          userId: staff?.id,
          email: staff?.email,
          unitId: formValues?.unit?.id,
          title: formValues?.positionTitle,
          rank: formValues?.rank,
          start: DateTime.fromJSDate(formValues.startDate).toISODate()!,
          end: formValues.endDate ? DateTime.fromJSDate(formValues.endDate).toISODate()! : undefined
        })
      )
    }
  })
})
</script>

<template>
  <div class="flex items-center justify-between gap-4" @click="emit('staffClick', staff)">
    <span class="flex-1" :class="{ 'text-primary underline': editingStaffId === staff?.id }">
      <span class="font-semibold">{{ `${staff?.fullName}` }}</span>
      <span>{{ ` (${staff?.username})` }}</span>
    </span>
    <span
      v-if="editingStaffId === staff?.id"
      class="icon-[teenyicons--tick-circle-solid] text-primary"
    ></span>
    <span v-else class="icon-[teenyicons--tick-circle-outline]"></span>
  </div>
  <template v-if="editingStaffId === staff?.id">
    <Divider class="mt-4! mb-3! p-0!" />
    <form @submit="onSubmit">
      <div class="grid grid-cols-2 gap-4">
        <AppTextInput name="positionTitle" label="Chức vụ" required placeholder="Nhập chức vụ" />
        <AppNumberInput name="rank" required label="STT" placeholder="Nhập số thứ tự" />
        <AppDateInput
          name="startDate"
          label="Ngày bắt đầu nhiệm kỳ"
          date-format="dd/mm/yy"
          required
          :append-to="'body'"
          auto-z-index
          placeholder="Chọn ngày"
        />
        <AppDateInput
          name="endDate"
          label="Ngày kết thúc"
          date-format="dd/mm/yy"
          :append-to="'body'"
          auto-z-index
          placeholder="Chọn ngày"
        />
        <AppSelect
          class="col-span-2"
          name="roles"
          label="Vai trò"
          placeholder="Chọn vai trò"
          multiple
          :fetch-options="fetchRolesOptions"
        />
        <AdditionalPermission
          class="col-span-2"
          @submit="(submitValues) => setFieldValue('additionalPermissions', submitValues)"
          :generatedPermissionsFromRoles="genPermissionsFromRoles(values?.roles ?? [])"
        />
      </div>
      <div class="mt-6 flex h-10 items-center justify-end gap-2">
        <Button
          type="submit"
          :loading="isCreating || isUpdatingRolesAndPermissionInPosition"
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          @click="console.log(errors, 'errorserrorserrors')"
        />
      </div>
      <ConfirmDialog group="createPosition" />
    </form>
  </template>
</template>
