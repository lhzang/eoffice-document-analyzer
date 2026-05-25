<script setup lang="ts">
import AppPasswordInput from '@/shared/components/form-elements/AppPasswordInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef } from 'vue'
import z from 'zod'
import { useChangePassword } from '../composables/useChangePassword'

type ModalType = InstanceType<typeof AppModal>
const modalRef = useTemplateRef<ModalType | null>('modalRef')

const props = defineProps<{
  id: string
}>()

const isVisible = ref(false)

const schema = toTypedSchema(
  z
    .object({
      oldPassword: z.string().min(1, { message: 'Vui lòng nhập mật khẩu cũ' }),
      newPassword: z.string().min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }),
      confirmPassword: z.string().min(1, { message: 'Vui lòng nhập lại mật khẩu mới' })
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Mật khẩu nhập lại không khớp',
      path: ['confirmPassword']
    })
)

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
})

const { mutate: changePassword, isPending } = useChangePassword({
  onSuccess: () => {
    toastSucceed({ detail: 'Đổi mật khẩu thành công' })
    isVisible.value = false
  }
})

const handleOpenModal = () => {
  resetForm()
  isVisible.value = true
}

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    accountId: props.id,
    oldPassword: values.oldPassword,
    newPassword: values.newPassword
  }
  changePassword(payload)
})

defineExpose({
  handleOpenModal
})
</script>

<template>
  <AppModal
    :wrapper-style="{ width: '90%', maxWidth: '500px', margin: '0 3rem' }"
    v-model:visible="isVisible"
    title="Đổi mật khẩu"
    ref="modalRef"
  >
    <form @submit="onSubmit">
      <div class="mx-auto flex w-full max-w-md flex-col gap-3">
        <AppPasswordInput
          name="oldPassword"
          label="Mật khẩu cũ"
          required
          placeholder="Nhập mật khẩu cũ"
          :error-message="errors?.oldPassword"
        />
        <AppPasswordInput
          name="newPassword"
          label="Mật khẩu mới"
          required
          placeholder="Nhập mật khẩu mới"
          :error-message="errors?.newPassword"
        />
        <AppPasswordInput
          name="confirmPassword"
          label="Nhập lại mật khẩu mới"
          required
          placeholder="Nhập lại mật khẩu mới"
          :error-message="errors?.confirmPassword"
        />
      </div>

      <slot name="footer">
        <div class="mt-4 flex w-full justify-end gap-4">
          <Button label="Hủy" type="button" @click="modalRef?.closeModal()" :disabled="isPending" />
          <Button label="Xác nhận" type="submit" :loading="isPending" />
        </div>
      </slot>
    </form>
  </AppModal>
</template>
