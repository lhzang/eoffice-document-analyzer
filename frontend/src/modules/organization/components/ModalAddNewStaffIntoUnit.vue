<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '@/shared/models/organization/unit'
import {
  cleanObject,
  genDegreeOptions,
  handleGetGenderOpts,
  toastSucceed
} from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
// import { createStaffSchema } from '../schemas/staffManagementSchema'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { DateTime } from 'luxon'
import { useCreateAccount } from '../composables/queries/useCreateAccount'
import { useCreatePosition } from '../composables/queries/useCreatePosition'
import { useUpdateRolesAndPermissonInPosition } from '../composables/queries/useUpdateRolesAndPermissonInPosition'
import { createStaffSchema } from '../schemas/staffManagementSchema'
import { fetchRolesOptions, genPermissionsFromRoles } from '../utils/permissions'
import AdditionalPermission from './AdditionalPermission.vue'

const emit = defineEmits<{
  (e: 'createStaff'): void
}>()

const isVisible = ref<boolean>(false)

const { mutateAsync: createAccount, isPending: isCreatingAccount } = useCreateAccount({
  onSuccess: () =>
    toastSucceed({
      detail: 'Thêm nhân sự thành công'
    })
})

const handleUpdateRolesAndPosition = async (id: string) => {
  if (!values?.hasUnit) return
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

const { mutate: createPosition, isPending: isCreatingPosition } = useCreatePosition({
  onSuccess: (id) => {
    // isVisible.value = false
    // emit('createPosition')
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
    isVisible.value = false
    emit('createStaff')
  }
})

const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.createPosition)

const filterDisableUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    isError.value ||
    isGetttingHasRoleUnits.value ||
    !hasRoleUnits?.value?.some((hasRoleUnit) => hasRoleUnit?.id === unit?.id)
  )
    return true
  return false
}

const confirm = useConfirm()
const { handleSubmit, values, setFieldValue, errors, validate, handleReset } = useForm({
  validationSchema: toTypedSchema(createStaffSchema),
  initialValues: {
    staffUnit: null,
    hasUnit: true
  }
})

const handleWhenModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    handleReset()
  }
}

const onSubmit = handleSubmit((values) => {
  confirm.require({
    group: 'addNewStaffIntoUnit',
    message: 'Thầy/Cô có xác nhận tạo nhân sự?',
    header: 'Tạo nhân sự',
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
      createAccount(
        cleanObject({
          email: values?.email,
          fullName: values?.fullName,
          degree: values?.degree?.value,
          gender: values?.gender?.value,
          phone: values?.phone,
          shouldCreateBSign: true
        }),
        {
          onSuccess: (id: string) => {
            if (values?.hasUnit && values?.staffUnit?.id) {
              createPosition({
                userId: id,
                email: values?.email,
                unitId: values?.staffUnit?.id,
                title: values?.positionTitle,
                rank: values?.rank,
                start: DateTime.fromJSDate(values.startDate).toISODate()!,
                end: values.endDate ? DateTime.fromJSDate(values.endDate).toISODate()! : undefined
              })
            } else {
              isVisible.value = false
              emit('createStaff')
            }
          }
        }
      )
    }
  })
})

defineExpose({
  openModal: (unit: TUnitSelectValue) => {
    isVisible.value = true
    setFieldValue('staffUnit', unit)
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Thêm nhân sự"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :wrapper-style="{ width: '60%' }"
  >
    <form @submit="onSubmit">
      <div class="grid grid-cols-12 gap-4">
        <AppTextInput
          class="col-span-4"
          name="fullName"
          label="Họ và tên"
          placeholder="Nhập họ và tên"
          required
        />

        <AppTextInput
          class="col-span-4"
          name="phone"
          label="SĐT"
          placeholder="Nhập số điện thoại"
        />
        <AppSelect
          class="col-span-4"
          name="gender"
          label="Giới tính"
          placeholder="Vui lòng chọn"
          :fetchOptions="handleGetGenderOpts"
          :isFetchOnInit="true"
        />
        <AppTextInput
          class="col-span-4"
          name="email"
          label="Email"
          required
          placeholder="Nhập email"
        />
        <AppSelect
          class="col-span-4"
          name="degree"
          label="Học vị"
          placeholder="Vui lòng chọn"
          :fetchOptions="genDegreeOptions"
          :isFetchOnInit="true"
        />
        <InternalUnitSelect
          class="col-span-8"
          label="Đơn vị"
          modalLabel="Chọn đơn vị"
          :is-select-multiple="false"
          type="FULL"
          disabled
          :model-value="values?.staffUnit"
          :checkIfUnitDisabled="filterDisableUnit"
        />
        <template v-if="values.staffUnit">
          <AppTextInput
            class="col-span-4"
            name="positionTitle"
            label="Chức vụ"
            required
            placeholder="Nhập chức vụ"
          />
          <AppNumberInput
            class="col-span-4"
            name="rank"
            required
            label="STT"
            placeholder="Nhập số thứ tự"
          />

          <AppDateInput
            class="col-span-4"
            name="startDate"
            label="Ngày bắt đầu nhiệm kỳ"
            date-format="dd/mm/yy"
            required
            :append-to="'body'"
            auto-z-index
            placeholder="Chọn ngày"
          />
          <AppDateInput
            class="col-span-4"
            name="endDate"
            label="Ngày kết thúc"
            date-format="dd/mm/yy"
            :append-to="'body'"
            auto-z-index
            placeholder="Chọn ngày"
          />
          <AppSelect
            class="col-span-4"
            name="roles"
            label="Vai trò"
            placeholder="Chọn vai trò"
            multiple
            :fetch-options="fetchRolesOptions"
          />
          <AdditionalPermission
            class="col-span-8"
            @submit="(submitValues) => setFieldValue('additionalPermissions', submitValues)"
            :generatedPermissionsFromRoles="genPermissionsFromRoles(values?.roles ?? [])"
          />
        </template>
      </div>
      <div class="mt-6 flex h-10 items-center justify-end gap-2">
        <Button
          type="submit"
          class="min-w-[100px]"
          label="Xác nhận"
          severity="primary"
          :loading="
            isCreatingPosition || isCreatingAccount || isUpdatingRolesAndPermissionInPosition
          "
        />
      </div>
      <ConfirmDialog group="addNewStaffIntoUnit" />
    </form>
  </AppModal>
</template>
