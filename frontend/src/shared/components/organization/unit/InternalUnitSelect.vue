<script setup lang="ts" generic="TIsMultiple extends boolean">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type {
  TStaffAndUnitSelectTab,
  TTreeUnitWithStaffNode,
  TUnitSelectValue
} from '@/shared/models/organization/unit'
import { toastWarning } from '@/shared/utils/common'
import { Button, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { cloneDeep } from 'lodash-es'
import FullTreeSelectInternalUnit from './FullTreeSelectInternalUnit.vue'

type TProps = {
  label?: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  isSelectMultiple: TIsMultiple
  tabList?: TStaffAndUnitSelectTab[]
  defaultValue?: (TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null
  type: 'FULL' | 'DECENDANT'
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
  isPreventSelectGroup?: boolean
}
type Modal = InstanceType<typeof AppModal>
let initialized = false

const {
  label = 'Đơn vị',
  modalLabel = 'Chọn đơn vị thực hiện',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  required = false,
  disabled,
  isSelectMultiple = false,
  defaultValue,
  type,
  checkIfUnitDisabled = () => false,
  isPreventSelectGroup = true
} = defineProps<TProps>()

const emit = defineEmits<{
  submit: [submitValue: (TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null]
  'unit-select': [unit: TTreeUnitWithStaffNode]
}>()

const modalRef = useTemplateRef<Modal>('modalRef')

const internalUnits = defineModel<
  (TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null
>()

const tempValue = ref<(TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null>(
  cloneDeep(defaultValue) ?? cloneDeep(internalUnits.value) ?? null
) as Ref<(TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null>

const displayValues = computed(() => {
  if (!internalUnits?.value) return ''
  return Array.isArray(internalUnits?.value)
    ? internalUnits?.value?.map((unit) => unit?.name)?.join(', ')
    : internalUnits?.value?.name
})
const handleOpenModalSelectUnit = () => {
  if (disabled) return
  tempValue.value = cloneDeep(internalUnits.value) ?? null
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (
    required &&
    (isSelectMultiple ? !(tempValue.value as TUnitSelectValue[])?.length : !tempValue.value)
  ) {
    return toastWarning({ detail: 'Vui lòng chọn ít nhất một đơn vị' })
  }
  internalUnits.value = cloneDeep(tempValue.value)
  emit('submit', internalUnits.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempValue.value = cloneDeep(defaultValue ?? null) as TIsMultiple extends false
    ? TUnitSelectValue
    : TUnitSelectValue[]
}
watch(
  () => defaultValue,
  (newVal) => {
    if (
      !initialized &&
      newVal &&
      (internalUnits.value == null || internalUnits.value === undefined)
    ) {
      internalUnits.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <slot name="triggerElement" :open="handleOpenModalSelectUnit">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="label" class="text-primary font-semibold"
        >{{ label }} <span v-if="required" class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm truncate border border-solid px-[.75rem] py-[.5rem] ${
            errorMessage
              ? 'border-[var(--p-inputtext-invalid-border-color)]'
              : 'border-[var(--p-inputtext-border-color)]'
          } rounded-md ${
            disabled
              ? 'cursor-not-allowed hover:border-[#94a3b8]'
              : 'hover:border-[var(--p-inputtext-border-color)]'
          } - all duration - 200 transition ${
            disabled
              ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]'
              : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'
          } relative`"
          @click="handleOpenModalSelectUnit"
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
    </div>
  </slot>

  <AppModal :title="modalLabel" ref="modalRef" :wrapper-style="{ width: '60%' }">
    <FullTreeSelectInternalUnit
      v-if="type === 'FULL'"
      :is-select-multiple="isSelectMultiple"
      v-model="tempValue"
      :check-if-unit-disabled="checkIfUnitDisabled"
      @unit-select="(unit) => emit('unit-select', unit)"
      :isPreventSelectGroup="isPreventSelectGroup"
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
</template>
