<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { TStaffLeaderFilterMode } from '@/shared/models/common'
import type { TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import type { TSigner } from '@/shared/models/outDoc/signer'
import { toastWarning } from '@/shared/utils/common'
import { Button, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import PreDefinedUnitStaffSignerWithoutOrder from './PreDefinedUnitStaffSignerWithoutOrder.vue'

type TProps = {
  required?: boolean
  label: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  disabled?: boolean
  defaultValue?: TSigner
  permittedStaffList: TSigner[]

  //decide if tree that render should be contain leader only or not
  filterLeaderMode?: TStaffLeaderFilterMode
  //filter staff by permissions (if collaborator signer may be permission in future)
  permissionFilter?: TAppFeatureKey
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
}
type Modal = InstanceType<typeof AppModal>
let initialized = false

const {
  label,
  modalLabel = 'Chọn các cá nhân thực hiện',
  placeholder = MSG_PLEASE_SELECT,
  required = false,
  errorMessage,
  disabled,
  defaultValue,
  permittedStaffList,
  permissionFilter,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()
const emit = defineEmits<{
  submit: [submitValue: TSigner | null]
}>()

const modalRef = useTemplateRef<Modal>('modalRef')

const internalStaff = defineModel<TSigner | null>()

const tempInternalStaff = ref<TSigner | null>(
  defaultValue ?? internalStaff.value ?? null
) as Ref<TSigner | null>

const displayValues = computed(() => {
  return internalStaff?.value?.displayName ?? ''
})

const handleOpenModalSelectStaff = () => {
  if (disabled) return
  tempInternalStaff.value = internalStaff.value ?? null
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (!tempInternalStaff.value && required) {
    return toastWarning({ detail: 'Vui lòng chọn một cá nhân' })
  }
  internalStaff.value = tempInternalStaff.value
  emit('submit', internalStaff.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempInternalStaff.value = defaultValue ?? null
}

watch(
  () => defaultValue,
  (newVal) => {
    if (
      !initialized &&
      newVal &&
      (internalStaff.value == null || internalStaff.value === undefined)
    ) {
      internalStaff.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <slot name="triggerElement" @click="handleOpenModalSelectStaff">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label class="text-primary font-semibold"
        >{{ label }} <span v-if="required" class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm truncate border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
          @click="handleOpenModalSelectStaff"
        >
          <div
            v-if="!false"
            class="h-full truncate text-[var(--p-inputtext-disabled-color)]"
            :class="{ 'text-[var(--vs-colors--dark)]': displayValues }"
          >
            {{ displayValues || placeholder }}
          </div>
        </div>
      </Tippy>
      <Message v-if="!!errorMessage" severity="error" size="small" variant="simple">
        {{ errorMessage }}
      </Message>
      <AppModal :title="modalLabel" ref="modalRef" :wrapper-style="{ width: '60%' }">
        <PreDefinedUnitStaffSignerWithoutOrder
          class="border-shadow col-span-5"
          :model-value="tempInternalStaff"
          :permittedStaffList
          @staff-select="
            (staff) => {
              tempInternalStaff = staff
            }
          "
          @staff-unselect="
            () => {
              tempInternalStaff = null
            }
          "
        />

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
    </div>
  </slot>
</template>
