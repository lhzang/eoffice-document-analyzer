<script setup lang="ts" generic="TIsMultiple extends boolean">
import { RECEIVER_TYPES } from '@/shared/constants/document'
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { Checkbox, RadioButton } from 'primevue'
import { nextTick, ref } from 'vue'
import type {
  TFormSelectDistribute,
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../../models/types'
import DistributeStaffSelect from './DistributeStaffSelect.vue'

//type
type TProps = {
  formInputList: TFormSelectDistribute[]
  isPersonalDistribute: boolean
  unit: TTreeUnitWithStaffNode
  disabled?: boolean
  level?: number
  disabledUnitsList?: Map<string, TTreeUnitWithStaffNode>
  isDistribute?: boolean
  checkIfUnitDisabled?: (unit: TSelectUnitDistributeValue) => boolean
  checkIfStaffDisabled?: (staff: TSelectStaffDistributeValue) => boolean
}

//props
const {
  formInputList,
  isPersonalDistribute,
  unit,
  disabled = false,
  level = 0,
  disabledUnitsList,
  isDistribute = true,
  availableRoles = [],
  checkIfUnitDisabled = () => false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()

//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0)
const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'unit-select': [TTreeUnitWithStaffNode, TFormSelectDistribute]
  'unit-unselect': [TTreeUnitWithStaffNode, TFormSelectDistribute]
  'staff-select': [TTreeStaffNodeNew, TFormSelectDistribute]
  'staff-unselect': [TTreeStaffNodeNew, TFormSelectDistribute]
}>()

const modelValue = defineModel<Map<string, TFormSelectDistributeItemValue>>({
  required: true
})

const handleCheckboxValueChange = async (
  selectedValue: TFormSelectDistributeItemValue[],
  formInput: TFormSelectDistribute
) => {
  if (selectedValue?.length) {
    modelValue.value?.set(unit.id, selectedValue[0])
    await nextTick()
    emits('unit-select', unit, formInput)
  } else {
    modelValue.value?.delete(unit.id)
    await nextTick()
    emits('unit-unselect', unit, formInput)
  }
}

const handleRadioValueChange = async (
  selectedValue: TFormSelectDistributeItemValue,
  formInput: TFormSelectDistribute
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
const handleClickRadio = async (e: MouseEvent, formInput: TFormSelectDistribute) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value?.delete(unit.id)
    await nextTick()
    emits('unit-unselect', unit, formInput)
  }
}

const toggleOpen = () => {
  isExpaned.value = !isExpaned.value
}
</script>
<template>
  <div
    :class="[
      `text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-2 py-2 font-bold lg:px-4 ${disabled && isDistribute ? 'cursor-not-allowed' : 'cursor-pointer'}`,
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
      <div
        @click.stop="() => handleUnitClick(unit)"
        class="truncate"
        v-tippy="unit?.name"
        :class="{
          // 'ml-[12px]': !(unit?.subUnits?.length && unit?.staffs?.length),
          'cursor-not-allowed': !isPersonalDistribute && !unit?.isGroup && unit?.relativeLevel !== 0
        }"
      >
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
          id: unit?.id,
          name: unit?.name,
          type: RECEIVER_TYPES.UNIT,
          isGroup: unit?.isGroup,
          formName: formInput.name
        }"
        :model-value="
          modelValue?.get(unit.id)?.formName === formInput.name ? [modelValue?.get(unit.id)] : []
        "
        @update:modelValue="
          (selectdValue: TFormSelectDistributeItemValue[]) =>
            handleCheckboxValueChange(selectdValue, formInput)
        "
        :disabled="
          (unit?.levelFromRoot ?? 0) > 1 ||
          checkIfUnitDisabled({
            id: unit?.id,
            name: unit?.name,
            type: RECEIVER_TYPES.UNIT,
            isGroup: unit?.isGroup
          }) ||
          (unit?.isGroup && !unit?.staffs?.length && !unit?.subUnits?.length) ||
          disabledUnitsList?.has(unit.id)
        "
        @click.stop
      ></Checkbox>
      <RadioButton
        v-else
        :name="formInput.name"
        :value="{
          id: unit?.id,
          name: unit?.name,
          type: RECEIVER_TYPES.UNIT,
          isGroup: unit?.isGroup,
          formName: formInput.name
        }"
        :model-value="
          modelValue?.get(unit.id)?.formName === formInput.name ? modelValue?.get(unit.id) : null
        "
        :disabled="
          unit?.isGroup ||
          unit?.levelFromRoot === 0 ||
          !!unit?.staffs?.length ||
          !!unit?.subUnits?.length ||
          (unit?.levelFromRoot ?? 0) > 1 ||
          (unit?.isGroup && !unit?.staffs?.length && !unit?.subUnits?.length) ||
          disabledUnitsList?.has(unit.id) ||
          checkIfUnitDisabled({
            id: unit?.id,
            name: unit?.name,
            type: RECEIVER_TYPES.UNIT,
            isGroup: unit?.isGroup
          })
        "
        @update:modelValue="
          (selectdValue: TFormSelectDistributeItemValue) =>
            handleRadioValueChange(selectdValue, formInput)
        "
        @click.stop="(e: MouseEvent) => handleClickRadio(e, formInput)"
      ></RadioButton>
    </div>
    <!-- <div class="flex h-auto shrink-0 items-center justify-center gap-1">
    </div> -->
  </div>
  <template v-if="isExpaned">
    <DistributeStaffSelect
      :form-input-list
      :disabled="disabled"
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="modelValue"
      @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
      @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
      :checkIfStaffDisabled="checkIfStaffDisabled"
    />
    <DistributeUnitSelect
      :form-input-list="formInputList"
      :is-personal-distribute="isPersonalDistribute"
      :disabled="disabled"
      :disabledUnitsList
      v-for="(subUnit, index) in unit?.subUnits"
      :key="index"
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
    />
  </template>
</template>
