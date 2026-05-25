<script setup lang="ts">
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import InternalUnitSelect from '@/shared/components/organization/unit/InternalUnitSelect.vue'
import type { TUnitSchema } from '@/shared/models/schema'
import type { AccountDetailVM } from '@/shared/services/api'
import { cleanObject, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watchEffect } from 'vue'
import { useCreatePosition } from '../composables/queries/useCreatePosition'
import { useUpdateRolesAndPermissonInPosition } from '../composables/queries/useUpdateRolesAndPermissonInPosition'
import { staffPositionSchema } from '../schemas/staffManagementSchema'
import { fetchRolesOptions, genPermissionsFromRoles } from '../utils/permissions'
import AdditionalPermission from './AdditionalPermission.vue'

type TProps = {
  staffDetail: AccountDetailVM
}

const emit = defineEmits<{
  (e: 'createdPosition'): void
}>()

const props = defineProps<TProps>()
const isVisible = ref(false)

const confirm = useConfirm()

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
    isVisible.value = false
    emit('createdPosition')
  }
})
const { handleSubmit, values, setFieldValue, handleReset } = useForm({
  validationSchema: toTypedSchema(staffPositionSchema),
  validateOnMount: false,
  initialValues: {
    roles: []
  }
})

const { errorMessage: unitErrMsg, setValue: setUnit } = useField<TUnitSchema>('unit')

watchEffect(() => {})
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

const handleOpendModal = () => {
  isVisible.value = true
}

const handleCloseModal = () => {
  isVisible.value = false
}

const handleCancel = () => {
  handleCloseModal()
}

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
      const { staffDetail } = props
      if (!formValues?.unit) return
      createdPosition(
        cleanObject({
          userId: staffDetail?.id,
          email: staffDetail?.email,
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

const handleVisibleChange = (visible: boolean) => {
  if (!visible) handleReset()
}

defineExpose({
  openModal: handleOpendModal,
  closeModal: handleCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    @update:visible="handleVisibleChange"
    :footer="false"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '99%', overflow: 'hidden' }"
    :classContent="'!overflow-hidden !pt-0 !p-0 h-full'"
    title="Thêm chức vụ"
  >
    <div class="relative h-full p-4">
      <form class="h-full" @submit="onSubmit">
        <div :style="{ height: 'calc(100% - 4rem)' }" class="overflow-auto px-4">
          <div class="grid grid-cols-2 gap-4">
            <InternalUnitSelect
              modal-label="Chọn đơn vị"
              label="Đơn vị"
              :required="true"
              type="FULL"
              :is-select-multiple="false"
              :error-message="unitErrMsg"
              @submit="
                (value) => {
                  setUnit(value)
                }
              "
            />
            <AppTextInput
              name="positionTitle"
              label="Chức vụ"
              required
              placeholder="Nhập chức vụ"
            />
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
        </div>
        <div class="absolute right-4 bottom-4 mt-2 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Huỷ"
            severity="secondary"
            variant="outlined"
            @click="handleCancel"
            :disabled="isCreating"
          />
          <Button
            type="submit"
            :loading="isCreating || isUpdatingRolesAndPermissionInPosition"
            class="min-w-[100px]"
            label="Xác nhận"
            severity="primary"
          />
        </div>
      </form>
    </div>
    <ConfirmDialog group="createPosition" />
  </AppModal>
</template>
