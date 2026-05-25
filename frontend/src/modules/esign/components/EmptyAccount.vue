<script setup lang="ts">
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from 'primevue'
import Button from 'primevue/button'
import { useForm } from 'vee-validate'
import { computed, ref } from 'vue'
import z from 'zod'
import { useCreateEsignAccount } from '../composables/esign-account/useCreateEsignAccount'
import type { CreateEsignAccountRequest } from '../model/esignAccount'

const props = defineProps<{
  esignProviderType: string
  accountId: string
  esignProviderName: string
  isLoading: boolean
}>()

const emit = defineEmits({
  created: () => true
})

const schema = computed(() => {
  const isRemoteSim =
    props.esignProviderType === 'vt_remote' || props.esignProviderType === 'vnpt_remote'

  return toTypedSchema(
    z.object({
      phone: isRemoteSim
        ? z.string().optional()
        : z.string().regex(/^84\d{9}$/, {
            message:
              'Số điện thoại phải bắt đầu bằng 84 và có đúng 11 chữ số, không chứa khoảng trắng'
          }),
      cccd: isRemoteSim
        ? z.string().regex(/^\d{12}$/, {
            message: 'Căn cước công dân phải đúng 12 chữ số không chứa khoảng trắng'
          })
        : z.string().optional()
    })
  )
})

const showModal = ref(false)
const toast = useToast()

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    phone: '',
    cccd: ''
  }
})

const queryClient = useQueryClient()

const { mutate: createEsignAccount, isPending } = useCreateEsignAccount({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['getEsignAccounts'] })
    emit('created')
    showModal.value = false
    toast.add({
      severity: 'success',
      life: APP_NOTI_TIME,
      summary: 'Tạo tài khoản chữ ký số thành công'
    })
  }
})

const onSubmit = handleSubmit((values) => {
  const isRemoteSim =
    props.esignProviderType === 'vt_remote' || props.esignProviderType === 'vnpt_remote'
  const request: CreateEsignAccountRequest = {
    accountId: props.accountId,
    simType: props.esignProviderType,
    ...(isRemoteSim ? { username: values.cccd } : { phone: values.phone })
  }
  createEsignAccount(request)
})
</script>

<template>
  <div>
    <div class="card">
      <h3 class="text-lg font-semibold">
        Thầy/Cô hiện chưa khai báo tài khoản chữ ký {{ esignProviderName }}!
      </h3>
      <p class="mt-2 text-gray-600">
        Nếu đã có tài khoản, Thầy/Cô có thể khai báo tài khoản tại đây để sử dụng trong các dịch vụ
        của Nhà Trường như BKOffice.
      </p>
      <div class="mt-4 flex justify-center">
        <Button
          label="Nhập tài khoản"
          @click="showModal = true"
          :disabled="isPending || isLoading"
        />
      </div>
    </div>
    <AppModal
      :wrapper-style="{ width: '90%', maxWidth: '500px', margin: '0 3rem' }"
      v-model:visible="showModal"
      title="Nhập thông tin tài khoản chữ ký số "
    >
      <form @submit.prevent="onSubmit">
        <div class="grid-col-1 grid">
          <AppTextInput
            :name="
              props.esignProviderType === 'vt_remote' || props.esignProviderType === 'vnpt_remote'
                ? 'cccd'
                : 'phone'
            "
            label=""
            required
            :error-message="
              props.esignProviderType === 'vt_remote' || props.esignProviderType === 'vnpt_remote'
                ? errors?.cccd
                : errors?.phone
            "
            :placeholder="
              props.esignProviderType === 'vt_remote' || props.esignProviderType === 'vnpt_remote'
                ? 'CCCD'
                : 'SĐT (84xx)'
            "
          />
        </div>

        <slot name="footer">
          <div class="mt-4 flex w-full justify-end gap-4">
            <Button label="Hủy" type="button" @click="showModal = false" :disabled="isPending" />
            <Button label="Xác nhận" type="submit" :loading="isPending" />
          </div>
        </slot>
      </form>
    </AppModal>
  </div>
</template>
