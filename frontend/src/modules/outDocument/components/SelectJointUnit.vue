<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TStaffAndUnitSelectTab, TUnitSelectValue } from '@/shared/models/organization/unit'
import { remapAccendingSequentialIndexes, toastWarning } from '@/shared/utils/common'
import { Button, Checkbox, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, watchEffect, type Ref } from 'vue'
import { Tippy } from 'vue-tippy'
import type { TJointUnitSelectValue } from '../models/document'
import { cloneDeep } from 'lodash-es'
import UnitSignOrder from './UnitSignOrder.vue'

type TProps = {
  label?: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  disabled?: boolean
  tabList?: TStaffAndUnitSelectTab[]
  defaultValue?: TJointUnitSelectValue[]
  hasStampUnits: TUnitSelectValue[]
  selectableUnitId: string[]
}
type Modal = InstanceType<typeof AppModal>
let initialized = false

const {
  label = 'Đơn vị liên tịch',
  modalLabel = 'Chọn đơn vị thực hiện',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  disabled,
  defaultValue
} = defineProps<TProps>()

const emit = defineEmits<{
  submit: [submitValue: TJointUnitSelectValue[]]
}>()

const modalRef = useTemplateRef<Modal>('modalRef')

const jointUnits = defineModel<TJointUnitSelectValue[]>({ default: [] })

const extractUnitFromIndexedValue = (
  indexedValues?: TJointUnitSelectValue[]
): TUnitSelectValue[] | undefined =>
  indexedValues?.map((indexedValue) => ({
    id: indexedValue?.unit.id,
    name: indexedValue?.unit?.name
  }))

const tempIndexedValueSelect = ref<TJointUnitSelectValue[]>(
  cloneDeep(defaultValue) ?? cloneDeep(jointUnits.value) ?? []
) as Ref<TJointUnitSelectValue[]>

const tempIsUnOrder = ref(false)

const tempUnitOnlySelect = computed(
  () => extractUnitFromIndexedValue(tempIndexedValueSelect?.value) ?? []
)

const displayValues = computed(() => {
  if (!jointUnits?.value) return ''
  return jointUnits?.value
    ?.map((jointUnit) => `${jointUnit?.unit?.name} (${jointUnit?.index})`)
    ?.join(', ')
})
const handleOpenModalSelectUnit = () => {
  if (disabled) return
  tempIndexedValueSelect.value = cloneDeep(jointUnits.value) ?? []
  tempIsUnOrder.value =
    tempIndexedValueSelect.value?.length > 1 &&
    tempIndexedValueSelect.value?.every((unit) => unit?.index === 1)
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (!(tempUnitOnlySelect.value as TUnitSelectValue[])?.length) {
    return toastWarning({ detail: 'Vui lòng chọn ít nhất một đơn vị' })
  }
  jointUnits.value = cloneDeep(tempIndexedValueSelect.value)
  emit('submit', jointUnits.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempIndexedValueSelect.value = cloneDeep(defaultValue) ?? []
  tempIsUnOrder.value =
    tempIndexedValueSelect.value?.length > 1 &&
    tempIndexedValueSelect.value?.every((unit) => unit?.index === 1)
}

const handleToggleChange = (event: Event, unit: TUnitSelectValue) => {
  const target = event?.target as HTMLInputElement

  if (target.checked) {
    tempIndexedValueSelect?.value?.push({
      unit,
      index: tempIsUnOrder.value
        ? 1
        : (tempIndexedValueSelect?.value?.[tempIndexedValueSelect.value?.length - 1]?.index ?? 0) + 1
    })
  } else {
    const filterValues = tempIndexedValueSelect.value?.filter((value) => {
      return value?.unit?.id !== unit?.id
    })
    const normalizedValues = remapAccendingSequentialIndexes(filterValues, 'index')
    tempIndexedValueSelect.value = normalizedValues
  }
}

watchEffect(() => {
  console.log(tempIndexedValueSelect?.value, 'ffasfasdfasdfasdfasdfasdfasdf')
})
watch(
  () => defaultValue,
  (newVal) => {
    if (!initialized && newVal && (jointUnits.value == null || jointUnits.value === undefined)) {
      jointUnits.value = newVal
      initialized = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <slot name="triggerElement" @click="handleOpenModalSelectUnit">
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="label" class="text-primary font-semibold"
        >{{ label }} <span class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm truncate border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
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
      <AppModal :title="modalLabel" ref="modalRef" :wrapper-style="{ width: '60%' }">
        <div class="grid grid-cols-8 gap-4">
          <div class="border-shadow col-span-5">
            <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
              <div class="item flex-1">Đơn vị liên tịch</div>
              <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
            </div>

            <div class="relative">
              <div
                v-if="!hasStampUnits?.length"
                class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
              >
                <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
                <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
              </div>
              <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
                <div
                  v-for="(unit, idx) in hasStampUnits"
                  :key="idx"
                  :class="`mb-1 flex h-10 w-full items-center gap-1 bg-white px-4 py-2 font-bold`"
                >
                  <Tippy class="w-full truncate" :content="unit?.name" placement="top-start">
                    <div class="w-full truncate">
                      {{ unit?.name }}
                    </div>
                  </Tippy>

                  <div class="flex h-auto w-10 shrink-0 items-center justify-center">
                    <Checkbox
                      name="unit"
                      v-model="tempUnitOnlySelect"
                      @change="(event) => handleToggleChange(event, unit)"
                      :value="unit"
                      @click.stop
                      :disabled="!selectableUnitId?.includes(unit?.id)"
                    ></Checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <UnitSignOrder
            class="border-shadow col-span-3"
            v-model="tempIndexedValueSelect"
            v-model:isUnOrder="tempIsUnOrder"
            @unit-removed="
              (jointUnit) => {
                let filterValues = tempIndexedValueSelect?.filter((value) => {
                  return value?.unit?.id !== jointUnit?.unit?.id
                })
                const normalizedValues = remapAccendingSequentialIndexes(filterValues, 'index')
                tempIndexedValueSelect = normalizedValues
              }
            "
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
