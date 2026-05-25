<script setup lang="ts">
import AppTextarea from '@/shared/components/form-elements/AppTextarea.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModalWithMessage from '@/shared/components/modals/AppModalWithMessage.vue'
import { toastSucceed } from '@/shared/utils/common'
import { DateTime } from 'luxon'
import { Button, ConfirmDialog, useConfirm } from 'primevue'
import { ref } from 'vue'
import { useApproveGuestCar } from '../composables/queries/carActions/useApproveGuestCar'
import { useRejectGuestCar } from '../composables/queries/carActions/useRejectGuestCar'
import { useGetDetailGuestCar } from '../composables/queries/carList/useGetDetailGuestCar'
import { CAR_STATUS } from '../constants/carStatus'

type TProps = {
  id: string
}
const { id } = defineProps<TProps>()
type ModalType = InstanceType<typeof AppModalWithMessage>

const { data: guestCarInfo, isLoading: isGettingGuestCar } = useGetDetailGuestCar(() => id)
const rejectModalRef = ref<ModalType | null>(null)

const confirm = useConfirm()

const emit = defineEmits<{
  (e: 'processedCar'): void
}>()

const { mutate: rejectGuestCar, isPending: isRejecting } = useRejectGuestCar({
  onSuccess: () => {
    toastSucceed({
      detail: 'Từ chối duyệt xe thành công'
    })
    rejectModalRef?.value?.closeModal()
    emit('processedCar')
  }
})
const { mutate: approveCar, isPending: isApproving } = useApproveGuestCar({
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
      if (!guestCarInfo?.value?.id) return
      rejectGuestCar({ id: guestCarInfo?.value?.id, reason })
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
      if (!guestCarInfo?.value?.id) return
      approveCar(guestCarInfo?.value?.id)
    }
  })
}
</script>
<template>
  <div v-if="isGettingGuestCar" class="mt-10 flex h-[200px] items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else class="grid grid-cols-2 gap-4">
    <AppTextInput
      label="Khách/Đoàn khách"
      disabled
      :model-value="guestCarInfo?.ownerName"
      name="ownerName"
    />
    <AppTextInput
      label="Đơn vị công tác"
      disabled
      :model-value="guestCarInfo?.guestUnitName"
      name="licensePlate"
    />
    <AppTextInput
      label="Biển số xe"
      disabled
      :model-value="guestCarInfo?.licensePlate"
      name="licensePlate"
    />
    <AppTextInput
      label="Đơn vị đến làm việc tại BKHN"
      disabled
      :model-value="guestCarInfo?.visitUnitName"
      name="visitUnitName"
    />
    <AppTextInput
      label="Ngày đến làm việc"
      disabled
      :model-value="`${guestCarInfo?.startDate ? DateTime.fromISO(guestCarInfo?.startDate).toFormat('dd/MM/yyyy') : '--'} - ${guestCarInfo?.endDate ? DateTime.fromISO(guestCarInfo?.endDate).toFormat('dd/MM/yyyy') : '--'}`"
      name="wordPeriod"
    />
    <AppTextInput
      label="Người tạo đơn"
      disabled
      :model-value="guestCarInfo?.creatorName"
      name="creatorName"
    />
    <AppTextarea
      disabled
      name="workContent"
      label="Nội dung làm việc"
      :model-value="guestCarInfo?.workContent"
    />
    <AppTextarea disabled name="note" label="Ghi chú" :model-value="guestCarInfo?.note" />
    <AppTextarea
      v-if="guestCarInfo?.status === CAR_STATUS.rejected"
      class="col-span-2"
      name="rejectReason"
      label="Lý do từ chối"
      disabled
      :model-value="guestCarInfo?.rejectionReason"
    />
  </div>
  <slot name="footer">
    <div class="mt-6 flex w-full justify-end gap-2" v-if="guestCarInfo?.canApprove">
      <Button
        v-if="
          guestCarInfo?.status === CAR_STATUS.accepted ||
          guestCarInfo?.status === CAR_STATUS.pending
        "
        label="Từ chối"
        :loading="isRejecting"
        variant="outlined"
        @click="rejectModalRef?.openModal()"
      />
      <Button
        :loading="isApproving"
        v-if="guestCarInfo?.status === CAR_STATUS.pending"
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
