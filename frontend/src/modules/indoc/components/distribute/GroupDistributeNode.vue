<script setup lang="ts" generic="TIsMultiple extends boolean">
import type { TDocumentProcessRole } from '@/shared/constants/document'
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type {} from '@/shared/models/outDoc/destination'
import { Checkbox, RadioButton } from 'primevue'
import { computed, ref, watch } from 'vue'
import type {
  TFormSelectDistribute,
  TFormSelectDistributeItemValue,
  TFormSelectDistributeItemValues,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../../models/types'
import {
  formatDistributeValueInputForUnit,
  getAllEnableDecendantUnitsAndStaffs
} from '../../utils/distributeUtils'
import StaffDistributeNode from './StaffDistributeNode.vue'
import UnitDistributeNode from './UnitDistributeNode.vue'

//type
type TProps = {
  isPersonalDistribute: boolean
  formInputList: TFormSelectDistribute[]
  unit: TTreeUnitWithStaffNode
  disabled?: boolean
  level?: number
  // disabledUnitsList?: Map<string, TTreeUnitWithStaffNode>
  initialUnitIDList: Set<string>
  isDistribute?: boolean
  readOnlySelectedItems?: TFormSelectDistributeItemValues
  isDefaultExpandAll: boolean
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
  initialUnitIDList,
  // disabledUnitsList,
  isDefaultExpandAll,
  isDistribute = true,
  readOnlySelectedItems = new Map<string, TFormSelectDistributeItemValue>(),
  checkIfUnitDisabled = () => false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()
//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0)
const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'group-unit-click': [TTreeUnitWithStaffNode, boolean, TFormSelectDistribute]
  'unit-select': [TTreeUnitWithStaffNode, TFormSelectDistribute]
  'unit-unselect': [TTreeUnitWithStaffNode, TFormSelectDistribute]
  'staff-select': [TTreeStaffNodeNew, TFormSelectDistribute]
  'staff-unselect': [TTreeStaffNodeNew, TFormSelectDistribute]
}>()

const selectedDistributedItemsModel = defineModel<Map<string, TFormSelectDistributeItemValue>>({
  required: true
})

const isInitialUnit = computed(() => {
  return initialUnitIDList?.has(unit?.id)
})
const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {
  toggleOpen()
  emits('unit-click', unit)
}

const toggleOpen = () => {
  isExpaned.value = !isExpaned.value
}

const checkIfTicked = (formInput: TDocumentProcessRole) => {
  const allChildsDes = getAllEnableDecendantUnitsAndStaffs(
    unit,
    initialUnitIDList,
    readOnlySelectedItems,
    // readOnlySelectedItems ?? new Map(),
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )

  const arrChildDes = Array.from(allChildsDes?.values())
  if (!arrChildDes?.length) return false
  const listSelectedFormInputFromSelectedItems = new Set<TDocumentProcessRole | undefined>()
  arrChildDes?.forEach((item) =>
    listSelectedFormInputFromSelectedItems.add(
      selectedDistributedItemsModel?.value?.get('positionId' in item ? item?.positionId : item?.id)
        ?.formName ??
        readOnlySelectedItems?.get('positionId' in item ? item?.positionId : item?.id)?.formName
    )
  )

  if (
    listSelectedFormInputFromSelectedItems?.size === 1 &&
    listSelectedFormInputFromSelectedItems.has(formInput)
  )
    return true
  return false
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
        readonly
        :true-value="true"
        :false-value="false"
        @click.stop="
          (event: any) => emits('group-unit-click', unit, event?.target?.checked, formInput)
        "
        binary
        :model-value="checkIfTicked(formInput.name)"
        :disabled="
          checkIfUnitDisabled(formatDistributeValueInputForUnit(unit)) ||
          !isInitialUnit ||
          readOnlySelectedItems?.has(unit.id) ||
          !getAllEnableDecendantUnitsAndStaffs(
            unit,
            initialUnitIDList,
            readOnlySelectedItems,
            // readOnlySelectedItems ?? new Map(),
            checkIfUnitDisabled,
            checkIfStaffDisabled
          )?.size
        "
      ></Checkbox>
      <RadioButton
        v-else
        :name="formInput.name"
        readonly
        :true-value="true"
        :false-value="false"
        binary
        :model-value="false"
        :disabled="true"
        @click.stop
      ></RadioButton>
    </div>
    <!-- <div class="flex h-auto shrink-0 items-center justify-center gap-1">
    </div> -->
  </div>
  <template v-if="isExpaned">
    <StaffDistributeNode
      :form-input-list
      :disabled="disabled"
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="selectedDistributedItemsModel"
      :readOnlySelectedItems
      @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
      @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
      :checkIfStaffDisabled="checkIfStaffDisabled"
    />
    <template v-for="(subUnit, index) in unit?.subUnits" :key="index">
      <GroupDistributeNode
        v-if="subUnit?.isGroup"
        :isPersonalDistribute
        :form-input-list="formInputList"
        :disabled="disabled"
        :unit="subUnit"
        :level="level + 1"
        v-model="selectedDistributedItemsModel"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        :readOnlySelectedItems
        :initialUnitIDList
        @unit-click="(unit) => emits('unit-click', unit)"
        @unit-select="(unit, formInput) => emits('unit-select', unit, formInput)"
        @unit-unselect="(unit, formInput) => emits('unit-unselect', unit, formInput)"
        @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
        @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
        @group-unit-click="
          (unit, isChecked, formInput) => emits('group-unit-click', unit, isChecked, formInput)
        "
        :isDefaultExpandAll
      />
      <UnitDistributeNode
        v-else
        :isPersonalDistribute
        :form-input-list="formInputList"
        :disabled="disabled"
        :unit="subUnit"
        :level="level + 1"
        :initialUnitIDList
        v-model="selectedDistributedItemsModel"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        :readOnlySelectedItems
        @unit-click="(unit) => emits('unit-click', unit)"
        @unit-select="(unit, formInput) => emits('unit-select', unit, formInput)"
        @unit-unselect="(unit, formInput) => emits('unit-unselect', unit, formInput)"
        @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
        @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
        @group-unit-click="
          (unit, isChecked, formInput) => emits('group-unit-click', unit, isChecked, formInput)
        "
        :isDefaultExpandAll
      />
    </template>
  </template>
</template>
