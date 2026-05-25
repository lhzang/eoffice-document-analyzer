<script setup lang="ts">
import { appConfig } from '@/config/app-config'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { GENDER_OPTIONS } from '@/shared/constants/common'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { SIGN_PROVIDER_LABEL } from '@/shared/constants/sign'
import type { AccountDetailVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject, handleGetGenderOpts, toastSucceed } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, Divider, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import { computed, useTemplateRef, watch } from 'vue'
import { useUpdateAccountInfo } from '../composables/queries/useUpdateAccountInfo'
import { staffInfoSchema } from '../schemas/staffManagementSchema'
import ModalChangePassword from './ModalChangePassword.vue'

type TChangePasswordModal = InstanceType<typeof ModalChangePassword>

type TProps = {
  staffDetail: AccountDetailVM
}

const changePasswordRef = useTemplateRef<TChangePasswordModal | null>('changePasswordRef')

const props = defineProps<TProps>()
const confirm = useConfirm()
const currentPermissions = computed(() => useUserProfileStore().user?.currentPermission ?? [])
const isHasManageAccount = computed(() =>
  checkIfUserHasPermission(currentPermissions.value, APP_PERMISSION_VALUES.manageAccount)
)
const emit = defineEmits<{
  (e: 'updatedStaff'): void
}>()

const { setValues, handleSubmit } = useForm({
  validationSchema: toTypedSchema(staffInfoSchema),
  initialValues: {
    phone: ''
  }
})

const { mutate: updateAccount, isPending: isUpdatingAccount } = useUpdateAccountInfo({
  onSuccess: () => {
    emit('updatedStaff')
    toastSucceed({ detail: 'Cập nhật thông tin nhân sự thành công' })
  }
})

watch(
  () => props.staffDetail,
  (staff) => {
    const defaultPosition = staff?.positions?.find(
      (position) => position?.id === staff?.defaultPositionId
    )
    setValues({
      fullName: staff?.fullName,
      gender: GENDER_OPTIONS?.find((gender) => gender?.value === staff?.gender),
      email: staff?.username,
      phone: staff?.phone ?? '',
      defaultSigningProvider: {
        label: SIGN_PROVIDER_LABEL?.[staff?.defaultSigningConfig?.signingProvider],
        value: staff?.defaultSigningConfig?.signingProvider
      },
      defaultPosition: defaultPosition
        ? {
            label: `${defaultPosition?.title} - ${defaultPosition?.unitShortName}`,
            value: defaultPosition?.id
          }
        : undefined
    })
  },
  { immediate: true }
)

const handleGetProviders = () => ({
  options: props.staffDetail?.signingConfig?.map((config) => ({
    label: SIGN_PROVIDER_LABEL?.[config.signingProvider],
    value: config.signingProvider
  })),
  hasMore: false
})
const handleGetPositions = () => ({
  options: props.staffDetail?.positions?.map((position) => ({
    label: `${position?.title} - ${position?.unitShortName}`,
    value: position?.id
  })),
  hasMore: false
})

const onSubmit = handleSubmit((formValues) => {
  confirm.require({
    group: 'updateStaff',
    message: 'Thầy/Cô có xác nhận cập nhật nhân sự này?',
    header: 'Cập nhật nhân sự',
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
      updateAccount({
        id: props?.staffDetail?.id,
        payload: cleanObject({
          fullName: formValues?.fullName,
          email: formValues?.email,
          phone: formValues?.phone,
          gender: formValues?.gender?.value,
          defaultPositionId: formValues.defaultPosition?.value,
          defaultSigningProvider: formValues?.defaultSigningProvider?.value
        })
      })
    }
  })
})
</script>
<template>
  <form @submit="onSubmit">
    <div class="grid grid-cols-2 gap-6">
      <AppTextInput
        :disabled="!isHasManageAccount"
        name="fullName"
        label="Họ và tên"
        placeholder="Nhập họ và tên"
        required
      />
      <AppSelect
        name="gender"
        label="Giới tính"
        :disabled="!isHasManageAccount"
        placeholder="Vui lòng chọn"
        :fetchOptions="handleGetGenderOpts"
      />
      <AppTextInput name="email" disabled label="Email" placeholder="Nhập email" required />
      <AppTextInput
        :disabled="!isHasManageAccount"
        name="phone"
        label="SĐT"
        placeholder="Nhập sđt"
      />
      <div
        class="col-span-2"
        v-if="currentPermissions?.includes(APP_PERMISSION_VALUES.changePassword)"
      >
        <Button
          label="Cập nhật mật khẩu"
          variant="contained"
          severity="primary"
          @click="changePasswordRef?.openModal()"
        />
      </div>
    </div>
    <Divider class="mt-6!" />
    <div class="grid grid-cols-2 gap-6">
      <AppSelect
        name="defaultSigningProvider"
        label="Chữ ký số mặc định để ký"
        :disabled="!isHasManageAccount"
        required
        placeholder="Vui lòng chọn"
        :fetchOptions="handleGetProviders"
      />
      <AppSelect
        name="defaultPosition"
        label="Vị trí khi đăng nhập mặc định"
        :disabled="!isHasManageAccount"
        placeholder="Vui lòng chọn"
        :fetchOptions="handleGetPositions"
      />
      <div>
        <label class="text-primary font-semibold">Ảnh chữ ký chính</label>
        <div
          class="h-60 rounded-md border border-solid border-[var(--p-inputtext-border-color)] py-[var(--p-inputtext-padding-y)] pl-[.75rem]"
        >
          <span
            v-if="!props.staffDetail?.signatureImageURLs?.primarySignature"
            class="font-semibold text-red-500"
            >{{
              `Chưa có ảnh chữ ký chính hoặc ảnh chữ ký đang chờ duyệt. Vui lòng cập nhật trên hệ
            thống ${appConfig.VITE_ESIGN_PROVIDER_LABEL}`
            }}.</span
          >
          <img
            v-else
            class="h-full w-full object-contain"
            :src="props.staffDetail?.signatureImageURLs?.primarySignature"
          />
        </div>
      </div>
      <div>
        <label class="text-primary font-semibold">Ảnh chữ ký nháy</label>
        <div
          class="h-60 rounded-md border border-solid border-[var(--p-inputtext-border-color)] py-[var(--p-inputtext-padding-y)] pl-[.75rem]"
        >
          <span
            v-if="!props.staffDetail?.signatureImageURLs?.initialSignature"
            class="font-semibold text-red-500"
            >{{
              `Chưa có ảnh chữ ký nháy hoặc ảnh chữ ký đang chờ duyệt. Vui lòng cập nhật trên hệ thống
            ${appConfig.VITE_ESIGN_PROVIDER_LABEL}.`
            }}</span
          >
          <img
            v-else
            class="h-full w-full object-contain"
            :src="props.staffDetail?.signatureImageURLs?.initialSignature"
          />
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end" v-if="isHasManageAccount">
      <Button :loading="isUpdatingAccount" type="submit" severity="containted" label="Cập nhật" />
    </div>
  </form>
  <ModalChangePassword
    ref="changePasswordRef"
    v-if="props.staffDetail?.id"
    :staff-id="props.staffDetail?.id"
    @changedPassword="changePasswordRef?.closeModal()"
  />
  <ConfirmDialog group="updateStaff" />
</template>
