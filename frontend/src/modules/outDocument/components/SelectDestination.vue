<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { TStaffAndUnitSelectTab } from '@/shared/models/organization/unit'
import type {
  TExUnitDestinationSelect,
  TFormSelectDestinationValue,
  TFormSelectDestinationValues,
  TInUnitDestinationSelect,
  TStaffDestinationSelect
} from '@/shared/models/outDoc/destination'
import { toastWarning } from '@/shared/utils/common'
import { getStaffAndUnitSelectTabLabel } from '@/shared/utils/organization/unit'
import { Button, Message } from 'primevue'
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { Tippy } from 'vue-tippy'
import { cloneDeep } from 'lodash-es'
import SelectExternalDestination from './SelectExternalDestination.vue'
import SelectInternalDestination from './SelectInternalDestination.vue'

type TProps = {
  label?: string
  modalLabel?: string
  placeholder?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  tabList?: TStaffAndUnitSelectTab[]
  hideLabel?: boolean
  unitId?: string
  readOnlySelectedDestinations?: TFormSelectDestinationValues
  checkIfStaffDisabled?: (staff: TStaffDestinationSelect) => boolean
  checkIfInUnitDisabled?: (unit: TInUnitDestinationSelect) => boolean
  checkIfExUnitDisabled?: (unit: TExUnitDestinationSelect) => boolean
  defaultValue?: TFormSelectDestinationValues
}
type Modal = InstanceType<typeof AppModal>

let initialized = false

const {
  label = 'Nơi nhận',
  hideLabel = false,
  modalLabel = 'Chọn nơi nhận văn bản',
  placeholder = MSG_PLEASE_SELECT,
  errorMessage,
  required,
  disabled,
  unitId,
  tabList = ['INTERNAL_TAB', 'EXTERNAL_TAB'],
  readOnlySelectedDestinations = new Map<string, TFormSelectDestinationValue>(),
  defaultValue
  // checkIfStaffDisabled
} = defineProps<TProps>()

const selectedTab = ref<TStaffAndUnitSelectTab>(tabList?.[0])

const emit = defineEmits<{
  submit: [submitValue: TFormSelectDestinationValues]
}>()
const modalRef = useTemplateRef<Modal>('modalRef')

const selectedDestinations = defineModel<TFormSelectDestinationValues>()
watchEffect(() => console.log(readOnlySelectedDestinations, 'fdsfsdafsdafsadfds'))
const tempValue = ref<TFormSelectDestinationValues>(
  cloneDeep(defaultValue) ?? cloneDeep(selectedDestinations?.value) ?? new Map()
)
const displayValues = computed(() => {
  if (!selectedDestinations?.value && !readOnlySelectedDestinations) return ''
  const listShowDes: string[] = []
  readOnlySelectedDestinations?.forEach((destination) => listShowDes?.push(destination?.name))
  selectedDestinations?.value?.forEach((destination) => listShowDes?.push(destination?.name))
  return listShowDes?.join(', ')
})

watch(
  () => defaultValue,
  (newVal) => {
    if (
      !initialized &&
      newVal &&
      (selectedDestinations.value == null || selectedDestinations.value === undefined)
    ) {
      selectedDestinations.value = cloneDeep(newVal)
      initialized = true
    }
  },
  { immediate: true }
)

watch(
  () => readOnlySelectedDestinations,
  (destinations) => {
    destinations?.forEach((destination) => {
      if (selectedDestinations?.value?.has(destination?.id))
        selectedDestinations?.value?.delete(destination?.id)
    })
  }
)

const handleOpenModalSelectDestination = () => {
  if (disabled || !unitId) return

  tempValue.value = cloneDeep(selectedDestinations.value) ?? new Map()
  modalRef?.value?.openModal()
}

const handleConfirmSelect = () => {
  if (required && !tempValue.value?.size) {
    return toastWarning({ detail: 'Vui lòng chọn ít nhất một nơi nhận' })
  }
  selectedDestinations.value = cloneDeep(tempValue.value)
  emit('submit', selectedDestinations.value)
  modalRef?.value?.closeModal()
}

const handleCancel = () => {
  tempValue.value = cloneDeep(defaultValue) ?? new Map()
}
</script>

<template>
  <slot
    name="triggerElement"
    @click="handleOpenModalSelectDestination"
    :selectedDestinations="selectedDestinations"
  >
    <div :class="`h-full w-full`" v-bind="$attrs">
      <label v-if="!hideLabel" class="text-primary font-semibold"
        >{{ label }} <span v-if="required" class="text-red-500">*</span></label
      >
      <Tippy :max-width="300" :content="displayValues">
        <div
          :class="`font-sm 0 border border-solid px-[.75rem] py-[.5rem] ${errorMessage ? 'border-[var(--p-inputtext-invalid-border-color)]' : 'border-[var(--p-inputtext-border-color)]'} rounded-md ${disabled ? 'cursor-not-allowed hover:border-[#94a3b8]' : 'hover:border-[var(--p-inputtext-border-color)]'} - all duration - 200 transition ${disabled ? 'bg-[var(--p-inputtext-disabled-background)] text-[var(--p-inputtext-disabled-color)]' : 'cursor-pointer bg-[var(--p-inputtext-background)] text-[var(--p-inputtext-color)]'} relative`"
          @click="handleOpenModalSelectDestination"
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
    <div
      class="mb-6 flex h-9 cursor-pointer items-center overflow-hidden rounded-md border bg-white"
    >
      <div
        v-for="(tab, idx) in tabList"
        :key="idx"
        class="flex h-full flex-1 items-center justify-center font-bold"
        :class="`${selectedTab === tab ? 'bg-primary text-white' : 'text-primary bg-inherit'}`"
        @click="() => (selectedTab = tab)"
      >
        {{ getStaffAndUnitSelectTabLabel(tab) }}
      </div>
    </div>
    <div>
      <SelectExternalDestination
        v-if="selectedTab === 'EXTERNAL_TAB'"
        v-model="tempValue"
        :readOnlySelectedDestinations
      />
      <SelectInternalDestination
        v-if="selectedTab === 'INTERNAL_TAB' && unitId"
        :readOnlySelectedDestinations
        v-model="tempValue"
        :unitId
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
        class="min-w-[100px]"
        label="Xác nhận"
        severity="primary"
        @click="handleConfirmSelect"
      />
    </div>
  </AppModal>
</template>
