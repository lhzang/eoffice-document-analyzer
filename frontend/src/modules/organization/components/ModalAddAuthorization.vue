<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Checkbox } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { ref } from 'vue'
import { useCreateRole } from '../composables/queries/useCreateRole'
import { authorizationConfigSchema } from '../schemas/authorizationConfigSchemas'
import PermissionConfig from './PermissionConfig.vue'

const emit = defineEmits<{
  (e: 'createdRole'): void
}>()

// const props = defineProps()
const isVisible = ref(false)

const { mutate: createRole, isPending: isCreating } = useCreateRole({
  onSuccess: () => {
    toastSucceed({
      detail: 'Thêm mới vai trò thành công'
    })
    isVisible.value = false
    emit('createdRole')
  }
})

const { handleSubmit, resetForm } = useForm({
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

const handleOpendModal = () => {
  handleResetForm()
  isVisible.value = true
}

const handleCloseModal = () => {
  handleResetForm()
  isVisible.value = false
}

const handleCancel = () => {
  handleCloseModal()
}

const onSubmit = handleSubmit((values) => {
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
  createRole(payload)
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
    title="Thêm vai trò"
  >
    <div class="relative h-full p-4">
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
            :disabled="isCreating"
          />
          <Button
            type="submit"
            :loading="isCreating"
            class="min-w-[100px]"
            label="Xác nhận"
            severity="primary"
          />
        </div>
      </form>
    </div>
  </AppModal>
</template>
