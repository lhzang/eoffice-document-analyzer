<script setup lang="ts" generic="TIsMultiple extends boolean">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { TStaffLeaderFilterMode } from '@/shared/models/common'
import type {
  TStaffAndUnitSelectTab,
  TStaffSelectValue,
  TTreeStaffNodeNew
} from '@/shared/models/organization/unit'
import { toastWarning } from '@/shared/utils/common'
import { Button, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { cloneDeep } from 'lodash-es'
import DecendantTreeSelectInternalStaff from './DecendantTreeSelectInternalStaff.vue'
import FullTreeSelectInternalStaff from './FullTreeSelectInternalStaff.vue'

type TBaseProps<TIsMultiple extends boolean> = {
  label?: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  isSelectMultiple: TIsMultiple
  tabList?: TStaffAndUnitSelectTab[]
  hideLabel?: boolean
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  //decide if tree that render should be contain leader only or not
  filterLeaderMode?: TStaffLeaderFilterMode
  //filter staff that has global permission
  permissionFilter?: TAppFeatureKey
  showSearch?: boolean
  defaultValue?: (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
}

// unioned discriminated props
// when user full then dont need rootId any more
type TProps<TIsMultiple extends boolean> =
  | (TBaseProps<TIsMultiple> & {
      type: 'FULL'
      rootUnitId?: undefined
    })
  | (TBaseProps<TIsMultiple> & {
      type: 'DECENDANT'
      rootUnitId: string
    })

type Modal = InstanceType<typeof AppModal>

let initialized = false

const {
  label = 'Đơn vị',
  hideLabel = false,
  modalLabel = 'Chọn cá nhân thực hiện',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  required,
  disabled,
  isSelectMultiple = false,
  defaultValue,
  rootUnitId,
  type,
  filterLeaderMode,
  permissionFilter,
  showSearch,
  checkIfStaffDisabled
} = defineProps<TProps<TIsMultiple>>()

const emit = defineEmits<{
  submit: [
    submitValue: (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
  ]
}>()
console.log(defaultValue, 'defaultValue')
const modalRef = useTemplateRef<Modal>('modalRef')

const internalStaffs = defineModel<
  (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
>() as Ref<TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]>

const tempValue = ref<(TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null>(
  cloneDeep(defaultValue) ?? cloneDeep(internalStaffs?.value) ?? null
) as Ref<TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]>
const displayValues = computed(() => {
  if (!internalStaffs?.value) return ''
  return Array.isArray(internalStaffs?.value)
    ? internalStaffs?.value?.map((unit) => unit?.displayName)?.join(', ')
    : internalStaffs?.value?.displayName
})

watch(
  () => defaultValue,
  (newVal) => {
    if (
      !initialized &&
      newVal &&
      (internalStaffs.value == null || internalStaffs.value === undefined)
    ) {
      internalStaffs.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)

const handleOpenModalSelectStaff = () => {
  if (disabled) return
  tempValue.value = cloneDeep(internalStaffs.value) ?? null
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (
    required &&
    (isSelectMultiple ? !(tempValue.value as TStaffSelectValue[])?.length : !tempValue.value)
  ) {
    return toastWarning({ detail: 'Vui lòng chọn ít nhất một nhân sự' })
  }
  internalStaffs.value = cloneDeep(tempValue.value)
  emit('submit', internalStaffs.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempValue.value = cloneDeep(defaultValue ?? null) as TIsMultiple extends false
    ? TStaffSelectValue
    : TStaffSelectValue[]
}
</script>

<template>
  <slot name="triggerElement" @click="handleOpenModalSelectStaff">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="!hideLabel" class="text-primary font-semibold"
        >{{ label }} <span v-if="required" class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm 0 border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
          @click="handleOpenModalSelectStaff"
        >
          <div
            v-if="!false"
            class="h-full w-full truncate text-[var(--p-inputtext-disabled-color)]"
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
    <FullTreeSelectInternalStaff
      v-if="type === 'FULL'"
      v-model="tempValue"
      :is-select-multiple="isSelectMultiple as TIsMultiple"
      :check-if-staff-disabled
      :filterLeaderMode
      :show-search
      :permissionFilter
    />
    <DecendantTreeSelectInternalStaff
      v-if="type === 'DECENDANT'"
      :rootUnitId="rootUnitId!"
      v-model="tempValue"
      :check-if-staff-disabled
      :filterLeaderMode
      :permissionFilter
      :show-search
      :is-select-multiple="isSelectMultiple as TIsMultiple"
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
