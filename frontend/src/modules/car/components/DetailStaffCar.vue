<script setup lang="ts">
import AppFileInputWithPreview from '@/shared/components/form-elements/AppFileInputWithPreview.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import { requireStringSchema } from '@/shared/schemas/commonSchema'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { getFileName, toastSucceed } from '@/shared/utils/common'
import { toTypedSchema } from '@vee-validate/zod'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { useForm } from 'vee-validate'
import z from 'zod'
import { useUpdateETag } from '../composables/queries/carActions/useUpdateETag'
import { useGetDetailStaffCar } from '../composables/queries/carList/useGetDetailStaffCar'
import { CAR_STATUS } from '../constants/carStatus'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()
const user = useUserProfileStore().user
const { data: staffCarInfo, isLoading: isGettingStaffCar } = useGetDetailStaffCar(() => id)

const validationSchema = z.object({
  eTag: requireStringSchema
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(validationSchema)
})

const confirm = useConfirm()

const emit = defineEmits<{
  (e: 'updateEtagSuccess'): void
}>()

const { mutate: updateETag, isPending: isUpdatingETag } = useUpdateETag({
  onSuccess: () => {
    toastSucceed({
      detail: 'Cập nhật xe thành công'
    })
    emit('updateEtagSuccess')
  }
})

const confirmEditETag = (eTag: string) => {
  confirm.require({
    group: 'confirmDetailStaffCar',
    message: `Thầy/Cô xác nhận cập nhật thông tin?`,
    header: 'Cập nhật',
    accept: () => {
      if (!staffCarInfo?.value?.id) return
      updateETag({
        id: staffCarInfo?.value?.id,
        eTag: eTag
      })
    },
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    }
  })
}

const onSubmit = handleSubmit((values) => {
  confirmEditETag(values?.eTag)
})
</script>
<template>
  <form @submit="onSubmit">
    <div v-if="isGettingStaffCar" class="mt-10 flex h-[200px] items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else class="grid grid-cols-2 gap-4">
      <AppTextInput
        label="Tên cán bộ"
        disabled
        :model-value="staffCarInfo?.staffName"
        name="staffName"
      />
      <AppTextInput
        label="Biển số xe"
        disabled
        :model-value="staffCarInfo?.licensePlate"
        name="licensePlate"
      />
      <AppTextInput
        label="Số eTag(VETC, ePass)"
        required
        :model-value="staffCarInfo?.eTag"
        name="eTag"
        :disabled="user?.id !== staffCarInfo?.accountId"
      />
      <AppFileInputWithPreview
        label="Mặt sau giấy đăng ký xe"
        :file-name="getFileName(staffCarInfo?.registrationFile ?? '') ?? '--'"
        :file-url="staffCarInfo?.registrationFile ?? ''"
        disabled
      />
      <AppTextarea
        v-if="staffCarInfo?.status === CAR_STATUS.rejected"
        class="col-span-2"
        name="rejectReason"
        label="Lý do từ chối"
        disabled
        :model-value="staffCarInfo?.rejectionReason"
      />
    </div>
    <slot name="footer">
      <div class="mt-6 flex w-full justify-end gap-2">
        <Button
          v-if="user?.id === staffCarInfo?.accountId"
          label="Cập nhật"
          type="submit"
          :loading="isUpdatingETag"
        />
      </div>
    </slot>
    <ConfirmDialog group="confirmDetailStaffCar" />
  </form>
</template>
