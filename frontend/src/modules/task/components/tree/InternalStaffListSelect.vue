<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import { Button } from 'primevue'
import { ref, useTemplateRef } from 'vue'
import InternalStaffListSelectTable from '@/modules/task/components/tree/InternalStaffListSelectTable.vue'
import InternalStaffListSelectPreview from '@/modules/task/components/tree/InternalStaffListSelectPreview.vue'

type TProps = {
  modalLabel?: string
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
}

const props = withDefaults(defineProps<TProps>(), {
  modalLabel: 'Vui lòng chọn người'
})

type Modal = InstanceType<typeof AppModal>
const modalRef = useTemplateRef<Modal>('modalRef')

const selectedValues = defineModel<TStaffSelectValue[] | null>()
const tempValue = ref<TStaffSelectValue[] | null>(selectedValues.value ?? [])

const openModal = () => {
  tempValue.value = selectedValues.value || []
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  selectedValues.value = tempValue.value ?? []
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempValue.value = selectedValues.value || []
}

defineExpose({
  openModal
})
</script>

<template>
  <AppModal :title="modalLabel" ref="modalRef" :wrapper-style="{ width: '80%' }">
    <div class="flex w-full justify-between gap-4">
      <div class="card w-[60%]">
        <InternalStaffListSelectTable 
          v-model="tempValue" 
          :check-if-staff-disabled="props.checkIfStaffDisabled"
          :check-if-unit-disabled="props.checkIfUnitDisabled"
        />
      </div>
      <InternalStaffListSelectPreview v-model="tempValue" />
    </div>

    <div class="mt-5 flex items-center justify-end gap-2">
      <Button
        class="min-w-[100px]"
        label="Đặt lại"
        severity="secondary"
        variant="outlined"
        @click="handleCancel"
      />
      <Button
        type="submit"
        class="min-w-[100px]"
        label="Xác nhận"
        severity="primary"
        @click="handleConfirmSelect"
      />
    </div>
  </AppModal>
</template>
