<script setup lang="ts" generic="TIsMultiple extends boolean">
import { Checkbox, RadioButton } from 'primevue'
import { computed, markRaw, ref, toRaw, watch } from 'vue'
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '../../../models/organization/unit'
import { transformGetSelectUnitValue } from '../../../utils/organization/unit'
//type
type TProps = {
  formName: string
  unit: TTreeUnitWithStaffNode
  isSelectMultiple: TIsMultiple
  disabled?: boolean
  level?: number
  isDefaultExpandAll?: boolean
  isPreventSelectGroup?: boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
}

//props
const {
  formName,
  isSelectMultiple,
  unit,
  disabled = false,
  level = 0,
  isDefaultExpandAll = false,
  isPreventSelectGroup = true,
  checkIfUnitDisabled = () => false
} = defineProps<TProps>()

const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'unit-select': [TTreeUnitWithStaffNode]
  'unit-unselect': [TTreeUnitWithStaffNode]
}>()

//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0 || isDefaultExpandAll)

const modelValue = defineModel<
  (TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null
>({
  required: true
})
const unitValue = computed(() => transformGetSelectUnitValue(unit))
const handleRadioValueChange = (selectedValue: TUnitSelectValue) => {
  if (selectedValue) {
    modelValue.value = selectedValue as TIsMultiple extends false
      ? TUnitSelectValue
      : TUnitSelectValue[]
    emits('unit-select', unit)
  }
}

const handleCheckboxToggle = (toggleItem: TUnitSelectValue[], item: TUnitSelectValue) => {
  if (toggleItem?.length) {
    modelValue.value = [
      ...((modelValue.value as TUnitSelectValue[]) ?? []).map((value) => markRaw(toRaw(value))),
      item
    ] as TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]
    emits('unit-select', unit)
  } else {
    modelValue.value = (modelValue.value as TUnitSelectValue[])!.filter(
      (value) => 'positionId' in value || value.id !== (item as TUnitSelectValue).id
    ) as TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]
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
  <div>
    <div
      :class="`border-shadow text-primary mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
      @click="openSub"
    >
      <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 18}px` }">
        <template v-if="unit?.subUnits?.length | unit?.staffs?.length">
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
            (modelValue as TUnitSelectValue[])?.find(
              (value) => !('positionId' in value) && value.id === unit.id
            )
              ? [unitValue]
              : []
          "
          @update:modelValue="(checked) => handleCheckboxToggle(checked, unitValue)"
          :value="unitValue"
          :disabled="checkIfUnitDisabled(unit) || (isPreventSelectGroup && unit?.isGroup)"
          @click.stop
        ></Checkbox>
        <RadioButton
          v-else
          :name="formName"
          v-model="modelValue"
          @update:modelValue="handleRadioValueChange"
          :value="unitValue"
          :disabled="checkIfUnitDisabled(unit) || (isPreventSelectGroup && unit?.isGroup)"
          @click.stop="handleClickRadio"
        ></RadioButton>
      </div>
    </div>
    <template v-if="isExpaned">
      <UnitSelect
        :form-name
        :isPreventSelectGroup
        :is-select-multiple
        :disabled
        :level="level + 1"
        v-for="(subUnit, index) in unit?.subUnits"
        :key="index"
        :unit="subUnit"
        v-model="modelValue"
        :isDefaultExpandAll
        :checkIfUnitDisabled
        @unit-click="(unit) => emits('unit-click', unit)"
        @unit-select="(unit) => emits('unit-select', unit)"
        @unit-unselect="(unit) => emits('unit-unselect', unit)"
      />
    </template>
  </div>
</template>
