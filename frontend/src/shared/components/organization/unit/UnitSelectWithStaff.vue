<script setup lang="ts" generic="TIsMultiple extends boolean">
import { Checkbox, RadioButton } from 'primevue'
import { computed, markRaw, ref, toRaw, watch } from 'vue'
import type {
  TInternalStaffAndUnitSelectValue,
  TStaffSelectValue,
  TTreeUnitWithStaffNode,
  TUnitSelectValue
} from '../../../models/organization/unit'
import { transformGetSelectUnitValue } from '../../../utils/organization/unit'
import StaffSelect from './StaffSelect.vue'
//type
type TProps = {
  formName: string
  unit: TTreeUnitWithStaffNode
  isSelectMultiple: TIsMultiple
  disabled?: boolean
  level?: number
  isDefaultExpandAll?: boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
  checkIfStaffDisabled?: (staff: TStaffSelectValue) => boolean
}

//props
const {
  formName,
  isSelectMultiple,
  unit,
  disabled = false,
  level = 0,
  isDefaultExpandAll = false,
  checkIfUnitDisabled = () => false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()

const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'unit-select': [TTreeUnitWithStaffNode]
  'unit-unselect': [TTreeUnitWithStaffNode]
  'staff-select': [TStaffSelectValue]
  'staff-unselect': [TStaffSelectValue]
}>()

//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0 || isDefaultExpandAll)

const modelValue = defineModel<
  | (TIsMultiple extends false
      ? TInternalStaffAndUnitSelectValue
      : TInternalStaffAndUnitSelectValue[])
  | null
>({
  required: true
})
const unitValue = computed(() => transformGetSelectUnitValue(unit))

const handleRadioValueChange = (selectedValue: TInternalStaffAndUnitSelectValue) => {
  if (selectedValue) {
    modelValue.value = selectedValue as TIsMultiple extends false
      ? TInternalStaffAndUnitSelectValue
      : TInternalStaffAndUnitSelectValue[]
    emits('unit-select', unit)
  }
}

const handleCheckboxToggle = (
  toggleItem: TUnitSelectValue[],
  item: TInternalStaffAndUnitSelectValue
) => {
  if (toggleItem?.length) {
    modelValue.value = [
      ...((modelValue.value as TInternalStaffAndUnitSelectValue[]) ?? []).map((value) =>
        markRaw(toRaw(value))
      ),
      item
    ] as TIsMultiple extends false
      ? TInternalStaffAndUnitSelectValue
      : TInternalStaffAndUnitSelectValue[]
    emits('unit-select', unit)
  } else {
    modelValue.value = (modelValue.value as TInternalStaffAndUnitSelectValue[])!.filter(
      (value) => 'positionId' in value || value.id !== (item as TUnitSelectValue).id
    ) as TIsMultiple extends false
      ? TInternalStaffAndUnitSelectValue
      : TInternalStaffAndUnitSelectValue[]
    emits('unit-unselect', unit)
  }
}

// allow radio button can be unselect
const handleClickRadio = async (e: MouseEvent) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value = null
    emits('unit-unselect', unit)
  }
}

const openSub = () => (isExpaned.value = !isExpaned.value)
watch(
  () => isDefaultExpandAll,
  (isExpand) => {
    isExpaned.value = isExpand || unit?.relativeLevel === 0
  }
)
</script>
<template>
  <div
    :class="`text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
    @click="openSub"
  >
    <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 18}px` }">
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
      <span :class="{ 'ml-[12px]': !(unit?.subUnits?.length || unit?.staffs?.length) }">{{
        unit?.name
      }}</span>
    </div>
    <div class="flex h-auto w-10 shrink-0 items-center justify-center">
      <Checkbox
        v-if="isSelectMultiple"
        :name="formName"
        :model-value="
          (modelValue as TInternalStaffAndUnitSelectValue[])?.find(
            (value) => !('positionId' in value) && value.id === unit.id
          )
            ? [unitValue]
            : []
        "
        @update:modelValue="(checked) => handleCheckboxToggle(checked, unitValue)"
        :value="unitValue"
        :disabled="checkIfUnitDisabled(unit)"
        @click.stop
      ></Checkbox>
      <RadioButton
        v-else
        :name="formName"
        v-model="modelValue"
        @update:modelValue="handleRadioValueChange"
        :value="unitValue"
        :disabled="checkIfUnitDisabled(unit)"
        @click.stop="handleClickRadio"
      ></RadioButton>
    </div>
  </div>
  <template v-if="isExpaned">
    <StaffSelect
      :form-name
      :is-select-multiple
      :disabled
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="modelValue"
      :isDefaultExpandAll
      :checkIfStaffDisabled
      @staff-select="(staff) => emits('staff-select', staff)"
      @staff-unselect="(staff) => emits('staff-unselect', staff)"
    />
    <UnitSelectWithStaff
      :form-name
      :is-select-multiple
      :disabled
      :level="level + 1"
      v-for="(subUnit, index) in unit?.subUnits"
      :key="index"
      :unit="subUnit"
      v-model="modelValue"
      :isDefaultExpandAll
      :checkIfUnitDisabled
      :checkIfStaffDisabled
      @unit-click="(unit) => emits('unit-click', unit)"
      @unit-select="(unit) => emits('unit-select', unit)"
      @unit-unselect="(unit) => emits('unit-unselect', unit)"
      @staff-select="(staff) => emits('staff-select', staff)"
      @staff-unselect="(staff) => emits('staff-unselect', staff)"
    />
  </template>
</template>
