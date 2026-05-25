<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import {
  APP_PERMISSION_LIST_LABEL,
  APP_PERMISSION_SCOPE_LABEL,
  type TAppFeatureKey
} from '@/shared/constants/permission'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref, watch, watchEffect } from 'vue'
import { useGetDetailRole } from '../composables/queries/useGetDetailRole'
import { useUpdateRole } from '../composables/queries/useUpdateRole'
import { authorizationConfigSchema } from '../schemas/authorizationConfigSchemas'
import PermissionConfig from './PermissionConfig.vue'

const emit = defineEmits<{
  (e: 'updatedRole'): void
}>()

// const props = defineProps()
const isVisible = ref(false)
const roleId = ref<string | null>(null)

const {
  data: detailRole,
  isLoading: isGettingDetail,
  isSuccess: isGetDetailSucess,
  error: errorGetDetail
} = useGetDetailRole(() => roleId?.value!, {
  enabled: () => !!roleId?.value
})

const { mutate: updateRole, isPending: isUpdating } = useUpdateRole({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật vai trò thành công'
    })
    handleCloseModal()
    emit('updatedRole')
  }
})

const { handleSubmit, setValues, resetForm, values, setErrors } = useForm({
  validationSchema: toTypedSchema(authorizationConfigSchema),
  initialValues: {
    displayedAsGroup: true,
    rank: 100,
    permissions: []
  },
  validateOnMount: false
})

const handleResetForm = () => {
  resetForm({
    values: {
      displayedAsGroup: true,
      rank: 100,
      permissions: []
    }
  })
}

const { value: displayedAsGroup } = useField<boolean>('displayedAsGroup')

const handleOpendModal = async (id: string) => {
  roleId.value = id
  isVisible.value = true
}

const handleCloseModal = () => {
  handleResetForm()
  roleId.value = null
  isVisible.value = false
}

const handleCancel = () => {
  handleCloseModal()
}

const onSubmit = handleSubmit((values) => {
  if (!roleId?.value) return
  const payload = {
    title: values?.title,
    description: values?.description,
    displayedAsGroup: values.displayedAsGroup,
    rank: Number(values?.rank),
    permissions: values?.permissions?.map((perm) => ({
      permission: perm?.permission?.value?.permission,
      scope: perm?.scope?.value,
      effect: perm?.effect,
      tenantId: perm?.unit?.id
    }))
  }
  updateRole({ id: roleId.value, payload: payload })
})

watch(
  [isGetDetailSucess, detailRole],
  ([isGetDetailSucess, detailRoleValue]) => {
    if (isGetDetailSucess && !!detailRole) {
      console.log(detailRole, 'detailRole')
      setValues({
        title: detailRoleValue?.title,
        description: detailRoleValue?.description,
        rank: detailRoleValue?.rank,
        displayedAsGroup: detailRoleValue?.displayedAsGroup,
        permissions: (detailRoleValue?.scopedPermissions ?? [])?.map((perm) => ({
          permission: {
            label:
              APP_PERMISSION_LIST_LABEL?.[perm.permission as TAppFeatureKey] ?? perm.permission,
            value: {
              permission: perm?.permission as TAppFeatureKey,
              isGlobal: perm?.isGlobal
            }
          },
          scope: {
            label: perm?.isGlobal
              ? APP_PERMISSION_SCOPE_LABEL.ALL
              : APP_PERMISSION_SCOPE_LABEL?.[perm?.scope],
            value: perm?.scope
          },
          effect: perm?.effect,
          unit: {
            id: perm?.tenant?.id,
            name: perm?.tenant?.name
          }
        }))
      })
    }
  },
  { immediate: true }
)

const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    handleResetForm()
    roleId.value = null
  }
}
watchEffect(() => {
  console.log(values, 'permissions')
})
defineExpose({
  openModal: handleOpendModal,
  closeModal: handleCloseModal
})
</script>
<template>
  <AppModal
    v-model:visible="isVisible"
    :footer="false"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '99%', overflow: 'hidden' }"
    :classContent="'!overflow-hidden !pt-0 !p-0 h-full'"
    title="Cập nhật vai trò"
    @update:visible="handleVisibleChange"
    :loading="isGettingDetail"
  >
    <div v-if="errorGetDetail" class="text-primary flex h-full justify-center font-semibold">
      {{
        errorGetDetail?.response?.data?.detail ??
        errorGetDetail?.message ??
        'Đã có lỗi khi lấy thông tin vai trò! Vui lòng thử lại sau!'
      }}
    </div>
    <div v-else class="relative h-full p-4">
      <form class="h-full" @submit="onSubmit">
        <div :style="{ height: 'calc(100% - 4rem)' }" class="overflow-auto px-4">
          <div class="grid grid-cols-24 gap-4">
            <AppTextInput
              class="col-span-10"
              name="title"
              label="Tên vai trò"
              placeholder="Nhập tên vai trò"
              required
            />
            <AppTextInput
              class="col-span-10"
              name="description"
              label="Mô tả"
              placeholder="Nhập mô tả"
              required
            />
            <AppNumberInput
              class="col-span-4"
              name="rank"
              label="STT"
              placeholder="Nhập STT"
              required
            />
            <div class="col-span-24 mb-3 flex items-center gap-2">
              <Checkbox v-model="displayedAsGroup" name="displayedAsGroup" :binary="true" />
              <label>Hiển thị dưới dạng khối</label>
            </div>
          </div>
          <PermissionConfig class="card w-full rounded-md" :isUseForPositionConfig="false" />
        </div>
        <div class="absolute right-4 bottom-4 mt-2 flex items-center justify-end gap-2">
          <Button
            class="min-w-[100px]"
            label="Huỷ"
            severity="secondary"
            variant="outlined"
            @click="handleCancel"
            :disabled="isUpdating"
          />
          <Button
            type="submit"
            :loading="isUpdating"
            class="min-w-[100px]"
            label="Xác nhận"
            severity="primary"
          />
        </div>
      </form>
    </div>
  </AppModal>
</template>
