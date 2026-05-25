<script lang="ts" setup>
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { notifyError } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, useToast } from 'primevue'
import { useForm } from 'vee-validate'
import { ref, useTemplateRef } from 'vue'
import z from 'zod'
import { useEditUserAccount } from '../composables/user-account/useEditUserAccount'
import type { UserAccountResponse } from '../model/userAccount'

defineProps<{
  isLoading?: boolean
}>()

type ModalType = InstanceType<typeof AppModal>
const userAccountResponse = ref<UserAccountResponse | null>(null)
const modalRef = useTemplateRef<ModalType | null>('modalRef')
const toast = useToast()

const schema = toTypedSchema(
  z.object({
    email: z.email({ message: 'Email không hợp lệ' }),
    phone: z.string().regex(/^84\d{8}$/, {
      message: 'Số điện thoại phải bắt đầu bằng 84 và có đúng 10 chữ số, không chứa khoảng trắng'
    })
  })
)

const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    phone: ''
  }
})

const queryClient = useQueryClient()
const { mutateAsync: editUserAccount, isPending } = useEditUserAccount({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['getUserAccount'] })
    modalRef.value?.closeModal()
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Xóa tài khoản thành công'
    })
  },
  onError: (e) => {
    notifyError(e, 'Xóa tài khoản thất bại')
  }
})

const onSubmit = handleSubmit(async (values) => {
  if (!userAccountResponse.value?._id) return
  await editUserAccount({
    email: 'lam.doba@hust.edu.vn',
    body: {
      info: {
        email: values.email,
        phone: values.phone
      }
    }
  })
})

defineExpose({
  openModal: (data: UserAccountResponse) => {
    userAccountResponse.value = data
    setValues({
      email: data.info.email,
      phone: data.info.phone?.toString()
    })
    modalRef.value?.openModal()
  },
  closeModal: () => {
    modalRef.value?.closeModal()
    userAccountResponse.value = null
    resetForm()
  }
})
</script>
<template>
  <div>
    <AppModal
      :wrapper-style="{ width: '90%', maxWidth: '900px', margin: '0 3rem' }"
      ref="modalRef"
      title="Cập nhật thông tin người dùng"
    >
      <form @submit="onSubmit">
        <div class="relative">
          <div class="grid gap-x-4 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
            <AppTextInput
              name="AccountId"
              label="AccountId"
              required
              disabled
              :placeholder="userAccountResponse?.accountId"
            />
            <AppTextInput name="email" label="Email" required :error-message="errors?.email" />
            <AppTextInput
              name="phone"
              label="Số điện thoại"
              required
              :error-message="errors?.phone"
            />
            <AppTextInput
              name="name"
              label="Họ tên"
              required
              disabled
              :placeholder="userAccountResponse?.info.name"
            />
            <AppTextInput
              name="unit"
              label="Đơn vị"
              required
              disabled
              :placeholder="userAccountResponse?.info.unit"
            />
            <AppTextInput
              name="organization"
              label="Tổ chức"
              required
              disabled
              :placeholder="userAccountResponse?.info.organization"
            />
          </div>

          <div class="mt-4 italic">
            * Lưu ý: Một số trường dữ liệu chỉ có thể cập nhật bởi Quản trị viên!
          </div>

          <slot name="footer">
            <div class="mt-4 flex w-full justify-end gap-4">
              <Button
                label="Hủy"
                type="button"
                @click="modalRef?.closeModal()"
                :disabled="isPending"
              />
              <Button label="Xác nhận" type="submit" :loading="isPending" />
            </div>
          </slot>
        </div>
      </form>
    </AppModal>
  </div>
</template>
