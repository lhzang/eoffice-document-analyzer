<script setup lang="ts" generic="TIsMultiple extends boolean">
import type { TDocumentProcessRole } from '@/shared/constants/document'
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type {
  TFormDestinationProcessRoleInput,
  TFormSelectDestinationValue,
  TFormSelectDestinationValues,
  TInUnitDestinationSelect,
  TStaffDestinationSelect
} from '@/shared/models/outDoc/destination'
import { formatSelectValueForInternalUnit } from '@/shared/utils/outDoc/destination'
import { Checkbox, RadioButton } from 'primevue'
import { computed, nextTick, ref, watch } from 'vue'
import InternalStaffDestinationSelect from './InternalStaffDestinationSelect.vue'
import UnSendInternalUnitDestination from './UnSendInternalUnitDestination.vue'

//type
type TProps = {
  formInputList: TFormDestinationProcessRoleInput[]
  unit: TTreeUnitWithStaffNode
  disabled?: boolean
  level?: number
  isDistribute?: boolean
  readOnlySelectedDestinations?: TFormSelectDestinationValues
  selectedCheckedReadOnlyInputs: Set<TDocumentProcessRole>
  isDefaultExpandAll: boolean
  checkIfUnitDisabled?: (unit: TInUnitDestinationSelect) => boolean
  checkIfStaffDisabled?: (staff: TStaffDestinationSelect) => boolean
}

//props
const {
  formInputList,
  unit,
  disabled = false,
  level = 0,
  isDistribute = true,
  readOnlySelectedDestinations = new Map<string, TFormSelectDestinationValue>(),
  isDefaultExpandAll,
  checkIfUnitDisabled = () => false,
  checkIfStaffDisabled = () => false,
  selectedCheckedReadOnlyInputs = new Set()
} = defineProps<TProps>()

//reactive
const isExpaned = ref<boolean>(unit?.relativeLevel === 0)
const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'unit-select': [TTreeUnitWithStaffNode, TFormDestinationProcessRoleInput]
  'unit-unselect': [TTreeUnitWithStaffNode, TFormDestinationProcessRoleInput]
  'staff-select': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
  'staff-unselect': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
  'unsend-unit-click': [TTreeUnitWithStaffNode, boolean, TFormDestinationProcessRoleInput]
}>()

const modelValue = defineModel<TFormSelectDestinationValues>({
  required: true
})

const itemValue = computed(() => formatSelectValueForInternalUnit(unit))
const handleCheckboxValueChange = async (
  selectedValue: TFormSelectDestinationValue[],
  formInput: TFormDestinationProcessRoleInput
) => {
  if (selectedValue?.length) {
    modelValue.value?.set(unit.id, selectedValue[0]!)
    await nextTick()
    emits('unit-select', unit, formInput)
  } else {
    modelValue.value?.delete(unit.id)
    await nextTick()
    emits('unit-unselect', unit, formInput)
  }
}

const handleRadioValueChange = async (
  selectedValue: TFormSelectDestinationValue,
  formInput: TFormDestinationProcessRoleInput
) => {
  if (selectedValue) {
    modelValue.value?.set(unit.id, selectedValue)
    await nextTick()
    emits('unit-select', unit, formInput)
  } else {
    modelValue.value?.delete(unit.id)
    await nextTick()
    emits('unit-unselect', unit, formInput)
  }
}

const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {
  toggleOpen()
  emits('unit-click', unit)
}

// allow radio button can be unselect
const handleClickRadio = async (e: MouseEvent, formInput: TFormDestinationProcessRoleInput) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value?.delete(unit.id)
    await nextTick()
    emits('unit-unselect', unit, formInput)
  }
}

const toggleOpen = () => {
  isExpaned.value = !isExpaned.value
}
watch(
  () => isDefaultExpandAll,
  (isExpand) => {
    isExpaned.value = isExpand || unit?.relativeLevel === 0
  }
)
</script>
<template>
  <div
    :class="[
      `border-shadow text-primary mb-1/4 flex h-12 items-center gap-1 bg-white px-2 py-2 font-bold lg:px-4 ${disabled && isDistribute ? 'cursor-not-allowed' : 'cursor-pointer'}`,
      $attrs.class
    ]"
  >
    <div
      class="flex flex-1 items-center truncate"
      :style="{ marginLeft: `${level * 16}px` }"
      @click="toggleOpen"
    >
      <template v-if="unit?.subUnits?.length || unit?.staffs?.length">
        <span
          v-if="isExpaned"
          class="icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
        <span
          v-else
          class="icon-[ic--round-keyboard-arrow-right] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
      </template>
      <div @click.stop="() => handleUnitClick(unit)" class="truncate" v-tippy="unit?.name">
        {{ unit?.name }}
      </div>
    </div>
    <div
      v-for="(formInput, idx) in formInputList"
      :key="idx"
      class="flex w-10 shrink-0 items-center justify-center lg:w-24"
    >
      <Checkbox
        v-if="formInput.type === 'checkbox'"
        :name="formInput.name"
        :value="{
          ...itemValue,
          formName: formInput.name
        }"
        :model-value="
          readOnlySelectedDestinations?.get(unit?.id)?.formName === formInput.name ||
          modelValue?.get(unit.id)?.formName === formInput.name
            ? [modelValue?.get(unit.id) ?? readOnlySelectedDestinations?.get(unit.id)]
            : []
        "
        @update:modelValue="
          (selectdValue: TFormSelectDestinationValue[]) =>
            handleCheckboxValueChange(selectdValue, formInput)
        "
        :disabled="
          checkIfUnitDisabled(formatSelectValueForInternalUnit(unit)) ||
          readOnlySelectedDestinations?.has(unit?.id) ||
          (unit?.isGroup && !unit?.staffs?.length && !unit?.subUnits?.length)
        "
        @click.stop
      ></Checkbox>
      <RadioButton
        v-else
        :name="formInput.name"
        :value="{
          ...itemValue,
          formName: formInput.name
        }"
        :model-value="
          readOnlySelectedDestinations?.get(unit?.id)?.formName === formInput.name ||
          modelValue?.get(unit.id)?.formName === formInput.name
            ? (modelValue?.get(unit.id) ?? readOnlySelectedDestinations?.get(unit.id))
            : null
        "
        :disabled="
          unit?.isGroup ||
          !!unit?.staffs?.length ||
          (unit?.isGroup && !unit?.staffs?.length && !unit?.subUnits?.length) ||
          readOnlySelectedDestinations?.has(unit?.id) ||
          checkIfUnitDisabled(formatSelectValueForInternalUnit(unit)) ||
          selectedCheckedReadOnlyInputs?.has(formInput.name)
        "
        @update:modelValue="
          (selectdValue: TFormSelectDestinationValue) =>
            handleRadioValueChange(selectdValue, formInput)
        "
        @click.stop="(e: MouseEvent) => handleClickRadio(e, formInput)"
      ></RadioButton>
    </div>

    <!-- <div class="flex h-auto shrink-0 items-center justify-center gap-1">
    </div> -->
  </div>
  <template v-if="isExpaned">
    <InternalStaffDestinationSelect
      :form-input-list
      :disabled="disabled"
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="modelValue"
      @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
      @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
      :readOnlySelectedDestinations
      :checkIfStaffDisabled="checkIfStaffDisabled"
      :selectedCheckedReadOnlyInputs
      :isDefaultExpandAll
    />
    <template v-for="(subUnit, index) in unit?.subUnits" :key="index">
      <UnSendInternalUnitDestination
        v-if="subUnit?.isGroup || subUnit?.containStaff"
        :form-input-list="formInputList"
        :disabled="disabled"
        :readOnlySelectedDestinations
        :unit="subUnit"
        :level="level + 1"
        v-model="modelValue"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        @unit-click="(unit) => emits('unit-click', unit)"
        @unit-select="(unit, formInput) => emits('unit-select', unit, formInput)"
        @unit-unselect="(unit, formInput) => emits('unit-unselect', unit, formInput)"
        @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
        @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
        @unsend-unit-click="
          (unit, isChecked, formInput) => emits('unsend-unit-click', unit, isChecked, formInput)
        "
        :selectedCheckedReadOnlyInputs
        :isDefaultExpandAll
      />
      <InternalUnitDestination
        v-else
        :form-input-list="formInputList"
        :disabled="disabled"
        :readOnlySelectedDestinations
        :unit="subUnit"
        :level="level + 1"
        v-model="modelValue"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        @unit-click="(unit) => emits('unit-click', unit)"
        @unit-select="(unit, formInput) => emits('unit-select', unit, formInput)"
        @unit-unselect="(unit, formInput) => emits('unit-unselect', unit, formInput)"
        @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
        @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
        @unsend-unit-click="
          (unit, isChecked, formInput) => emits('unsend-unit-click', unit, isChecked, formInput)
        "
        :selectedCheckedReadOnlyInputs
        :isDefaultExpandAll
      />
    </template>
  </template>
</template>
