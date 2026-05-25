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
import {
  formatSelectValueForInternalUnit,
  getAllEnableDecendantUnitsAndStaffs
} from '@/shared/utils/outDoc/destination'
import { Checkbox, RadioButton } from 'primevue'
import { ref, watch } from 'vue'
import InternalStaffDestinationSelect from './InternalStaffDestinationSelect.vue'
import InternalUnitDestination from './InternalUnitDestination.vue'

//type
type TProps = {
  formInputList: TFormDestinationProcessRoleInput[]
  unit: TTreeUnitWithStaffNode
  disabled?: boolean
  level?: number
  // disabledUnitsList?: Map<string, TTreeUnitWithStaffNode>
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
  // disabledUnitsList,
  isDistribute = true,
  selectedCheckedReadOnlyInputs = new Set(),
  readOnlySelectedDestinations = new Map<string, TFormSelectDestinationValue>(),
  isDefaultExpandAll,
  checkIfUnitDisabled = () => false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()
//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0 || isDefaultExpandAll)
const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'unsend-unit-click': [TTreeUnitWithStaffNode, boolean, TFormDestinationProcessRoleInput]
  'unit-select': [TTreeUnitWithStaffNode, TFormDestinationProcessRoleInput]
  'unit-unselect': [TTreeUnitWithStaffNode, TFormDestinationProcessRoleInput]
  'staff-select': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
  'staff-unselect': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
}>()

const selectedDestinations = defineModel<TFormSelectDestinationValues>({
  required: true
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
    readOnlySelectedDestinations ?? new Map(),
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )

  const arrChildDes = Array.from(allChildsDes?.values())
  if (!arrChildDes?.length) return false
  const listSelectedFormInputFromSelectedDestinations = new Set<TDocumentProcessRole | undefined>()
  arrChildDes?.forEach((destination) =>
    listSelectedFormInputFromSelectedDestinations.add(
      selectedDestinations?.value?.get(
        'positionId' in destination ? destination?.positionId : destination?.id
      )?.formName ??
        readOnlySelectedDestinations?.get(
          'positionId' in destination ? destination?.positionId : destination?.id
        )?.formName
    )
  )

  if (
    listSelectedFormInputFromSelectedDestinations?.size === 1 &&
    listSelectedFormInputFromSelectedDestinations.has(formInput)
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
          (event: any) => emits('unsend-unit-click', unit, event?.target?.checked, formInput)
        "
        binary
        :model-value="checkIfTicked(formInput.name)"
        :disabled="
          (unit?.levelFromRoot ?? 0) > 1 ||
          checkIfUnitDisabled(formatSelectValueForInternalUnit(unit)) ||
          (unit?.isGroup && !unit?.staffs?.length && !unit?.subUnits?.length) ||
          readOnlySelectedDestinations?.has(unit.id) ||
          !getAllEnableDecendantUnitsAndStaffs(
            unit,
            readOnlySelectedDestinations ?? new Map(),
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
    <InternalStaffDestinationSelect
      :form-input-list
      :disabled="disabled"
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="selectedDestinations"
      :readOnlySelectedDestinations
      @staff-select="(staff, formInput) => emits('staff-select', staff, formInput)"
      @staff-unselect="(staff, formInput) => emits('staff-unselect', staff, formInput)"
      :checkIfStaffDisabled="checkIfStaffDisabled"
      :selectedCheckedReadOnlyInputs
      :isDefaultExpandAll
    />
    <template v-for="(subUnit, index) in unit?.subUnits" :key="index">
      <UnSendInternalUnitDestination
        v-if="subUnit?.isGroup || subUnit?.containStaff"
        :form-input-list="formInputList"
        :disabled="disabled"
        :unit="subUnit"
        :level="level + 1"
        v-model="selectedDestinations"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        :readOnlySelectedDestinations
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
        :unit="subUnit"
        :level="level + 1"
        v-model="selectedDestinations"
        :isDistribute
        :checkIfUnitDisabled="checkIfUnitDisabled"
        :checkIfStaffDisabled="checkIfStaffDisabled"
        :readOnlySelectedDestinations
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
