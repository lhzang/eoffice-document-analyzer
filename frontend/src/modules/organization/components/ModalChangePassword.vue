<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import { toastSucceed } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, Message, Password, useToast } from 'primevue'
import { useField, useForm } from 'vee-validate'
import { useTemplateRef } from 'vue'
import { z } from 'zod'
import { useUpdateUserPassword } from '../composables/queries/useUpdateUserPassword'

type TProps = {
  staffId: string
}
const emit = defineEmits<{
  (e: 'changedPassword'): void
}>()
const { staffId } = defineProps<TProps>()
type ModalType = InstanceType<typeof AppModal>

const schema = toTypedSchema(
  z.object({
    newPassword: requireStringSchema
  })
)

const { mutate: updateUserPassword, isPending: isUpdatingUserPassword } = useUpdateUserPassword({
  onSuccess: () => {
    toastSucceed({ detail: 'Cập nhật mật khẩu thành công' })
    emit('changedPassword')
  }
})

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    newPassword: ''
  }
})

const { value: newPassword } = useField<string>('newPassword')

const modalRef = useTemplateRef<ModalType | null>('modalRef')

const toast = useToast()

const queryClient = useQueryClient()

const onSubmit = handleSubmit((values) => {
  updateUserPassword({
    accountId: staffId,
    newPassword: values.newPassword
  })
})

const handleChangeModalVisible = (visible: boolean) => {
  if (!visible) resetForm()
}

defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal
    :wrapper-style="{ width: '400px' }"
    ref="modalRef"
    title="Thêm mới loại văn bản"
    @update:visible="handleChangeModalVisible"
  >
    <form @submit="onSubmit">
      <div>
        <span>
          <label class="text-primary font-semibold"
            >Mật khẩu mới <span class="text-red-500">*</span></label
          >
        </span>
        <Password fluid v-model="newPassword" toggleMask :feedback="false" />
        <Message v-if="!!errors?.newPassword" severity="error" size="small" variant="simple">
          {{ errors?.newPassword }}
        </Message>
      </div>
      <slot name="footer">
        <div class="mt-6 flex w-full justify-end">
          <Button :loading="isUpdatingUserPassword" label="Xác nhận" type="submit" />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
