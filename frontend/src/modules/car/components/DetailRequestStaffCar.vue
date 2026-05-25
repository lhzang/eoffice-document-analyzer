<script setup lang="ts">
import AppFileInputWithPreview from '@/shared/components/form-elements/AppFileInputWithPreview.vue'
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import { getFileName, toastSucceed } from '@/shared/utils/common'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { ref } from 'vue'
import { useApproveStaffCar } from '../composables/queries/carActions/useApproveStaffCar'
import { useRejectStaffCar } from '../composables/queries/carActions/useRejectStaffCar'
import { useGetDetailStaffCar } from '../composables/queries/carList/useGetDetailStaffCar'
import { CAR_STATUS } from '../constants/carStatus'

type TProps = {
  id: string
}
type ModalType = InstanceType<typeof AppModalWithMessage>

const { id } = defineProps<TProps>()

const rejectModalRef = ref<ModalType | null>(null)

const confirm = useConfirm()

const emit = defineEmits<{
  (e: 'processedCar'): void
}>()

const { mutate: rejectStaffCar, isPending: isRejecting } = useRejectStaffCar({
  onSuccess: () => {
    toastSucceed({
      detail: 'Từ chối duyệt xe thành công'
    })
    rejectModalRef?.value?.closeModal()
    emit('processedCar')
  }
})
const { mutate: approveCar, isPending: isApproving } = useApproveStaffCar({
  onSuccess: () => {
    toastSucceed({
      detail: 'Duyệt xe thành công'
    })
    rejectModalRef?.value?.closeModal()
    emit('processedCar')
  }
})

const handleConfirmReject = (reason?: string) => {
  if (!reason) return
  confirm.require({
    group: 'approveCar',
    message: 'Thầy/Cô có xác nhận từ chối duyệt xe?',
    header: 'Từ chối',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      if (!staffCarInfo?.value?.id) return
      rejectStaffCar({ id: staffCarInfo?.value?.id, reason })
    }
  })
}

const handleConfirmApprove = () => {
  confirm.require({
    group: 'approveCar',
    message: 'Thầy/Cô có xác nhận duyệt xe?',
    header: 'Duyệt',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Xác nhận',
      severity: 'danger'
    },
    accept: () => {
      if (!staffCarInfo?.value?.id) return
      approveCar(staffCarInfo?.value?.id)
    }
  })
}

const { data: staffCarInfo, isLoading: isGettingStaffCar } = useGetDetailStaffCar(() => id)
</script>
<template>
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
      disabled
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
    <div class="mt-6 flex w-full justify-end gap-2" v-if="staffCarInfo?.canApprove">
      <Button
        v-if="
          staffCarInfo?.status === CAR_STATUS.accepted ||
          staffCarInfo?.status === CAR_STATUS.pending
        "
        label="Từ chối"
        :loading="isRejecting"
        variant="outlined"
        @click="rejectModalRef?.openModal()"
      />
      <Button
        :loading="isApproving"
        v-if="staffCarInfo?.status === CAR_STATUS.pending"
        @click="handleConfirmApprove"
        label="Đồng ý"
      />
    </div>
  </slot>
  <AppModalWithMessage
    ref="rejectModalRef"
    title="Từ chối"
    :isMessageRequired="true"
    @submit="({ message }) => handleConfirmReject(message)"
    labelMessageInput="Lý do từ chối"
  />
  <ConfirmDialog group="approveCar" />
</template>
