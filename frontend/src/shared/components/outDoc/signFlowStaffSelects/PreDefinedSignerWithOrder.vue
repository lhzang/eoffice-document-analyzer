<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TSigner, TSignerWithSignOrder } from '@/shared/models/outDoc/signer'
import { remapAccendingSequentialIndexes, toastWarning } from '@/shared/utils/common'
import { extractSignerFromIndexedValue } from '@/shared/utils/outDoc/signer'
import { Button, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, watchEffect, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import { cloneDeep } from 'lodash-es'
import StaffSignOrder from '../StaffSignOrder.vue'
import PreDefinedUnitStaffSignerSelectWithOrder from './PreDefinedUnitStaffSignerSelectWithOrder.vue'

type TProps = {
  label: string
  modalLabel?: string
  required?: boolean
  placeholder?: string
  errorMessage?: string
  disabled?: boolean
  defaultValue?: TSignerWithSignOrder[]
  isDefaultUnOrdered?: boolean
  permittedStaffList: TSigner[]
}

type Modal = InstanceType<typeof AppModal>

const {
  label,
  modalLabel = 'Chọn các cá nhân thực hiện',
  required = false,
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  disabled,
  defaultValue,
  isDefaultUnOrdered = false,
  permittedStaffList
} = defineProps<TProps>()

const emit = defineEmits<{
  submit: [staffs: TSignerWithSignOrder[], isCollab: boolean]
}>()
watchEffect(() => console.log(isDefaultUnOrdered, 'isDefaultUnOrderedisDefaultUnOrdered'))
let initialized = false

const modalRef = useTemplateRef<Modal>('modalRef')

const internalStaffs = defineModel<TSignerWithSignOrder[]>()

const tempIndexedValueSelect = ref<TSignerWithSignOrder[]>(
  defaultValue ?? internalStaffs.value ?? []
) as Ref<TSignerWithSignOrder[]>
const tempIsUnOrder = ref(isDefaultUnOrdered)

const tempStaffOnlySelect = computed(
  () => extractSignerFromIndexedValue(tempIndexedValueSelect?.value) ?? []
)

const displayValues = computed(() => {
  if (!internalStaffs?.value) return ''
  return internalStaffs?.value
    ?.map((staff) => `${staff?.staff?.displayName} (${staff?.index})`)
    ?.join(', ')
})

const handleOpenModalSelectStaff = () => {
  if (disabled) return
  tempIndexedValueSelect.value = cloneDeep(internalStaffs.value) ?? []
  tempIsUnOrder.value = isDefaultUnOrdered
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (!(tempIndexedValueSelect.value as TSignerWithSignOrder[])?.length && required) {
    return toastWarning({ detail: 'Vui lòng chọn ít nhất một nhân sự' })
  }
  internalStaffs.value = cloneDeep(tempIndexedValueSelect.value)
  emit('submit', internalStaffs.value, tempIsUnOrder.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempIndexedValueSelect.value = defaultValue ?? []
  tempIsUnOrder.value = isDefaultUnOrdered
}

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
</script>
<template>
  <slot name="triggerElement" @click="handleOpenModalSelectStaff">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label class="text-primary font-semibold">{{ label }} </label>
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
        <div class="grid grid-cols-8 gap-4">
          <PreDefinedUnitStaffSignerSelectWithOrder
            class="border-shadow col-span-5"
            :model-value="tempStaffOnlySelect"
            :permittedStaffList
            @staff-select="
              (staff) => {
                tempIndexedValueSelect?.push({
                  staff,
                  index: tempIsUnOrder
                    ? 1
                    : (tempIndexedValueSelect?.[tempIndexedValueSelect?.length - 1]?.index ?? 0) + 1
                })
              }
            "
            @staff-unselect="
              (staff) => {
                //store signIndex of removed value
                let filterValues = tempIndexedValueSelect?.filter((value) => {
                  return value?.staff?.positionId !== staff?.positionId
                })
                const normalizedValues = remapAccendingSequentialIndexes(filterValues, 'index')
                tempIndexedValueSelect = normalizedValues
              }
            "
          />

          <StaffSignOrder
            class="border-shadow col-span-3"
            v-model="tempIndexedValueSelect"
            v-model:is-un-order="tempIsUnOrder"
            @staff-removed="
              (staff) => {
                let filterValues = tempIndexedValueSelect?.filter((value) => {
                  return value?.staff?.positionId !== staff?.staff?.positionId
                })
                const normalizedValues = remapAccendingSequentialIndexes(filterValues, 'index')
                tempIndexedValueSelect = normalizedValues
              }
            "
            :isDefaultUnOrdered
          />
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
    </div>
  </slot>
</template>
