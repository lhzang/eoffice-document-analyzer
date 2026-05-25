<script setup lang="ts" generic="TIsMultiple extends boolean">
import { ref, watch } from 'vue'
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '../../../models/organization/unit'
import StaffOnlySelect from './StaffOnlySelect.vue'
//type
type TProps = {
  formName: string
  unit: TTreeUnitWithStaffNode
  isSelectMultiple: TIsMultiple
  disabled?: boolean
  level?: number
  isDefaultExpandAll?: boolean
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
}

//props
const {
  formName,
  isSelectMultiple,
  unit,
  disabled = false,
  level = 0,
  isDefaultExpandAll = false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()
const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
  'staff-select': [TStaffSelectValue]
  'staff-unselect': [TStaffSelectValue]
}>()

//reactive

const isExpaned = ref<boolean>(unit?.relativeLevel === 0 || isDefaultExpandAll)

const modelValue = defineModel<
  (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
>({
  required: true
})

const openSub = () => {
  isExpaned.value = !isExpaned.value
  emits('unit-click', unit)
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
    <div class="flex h-auto w-10 shrink-0 items-center justify-center"></div>
  </div>
  <template v-if="isExpaned">
    <StaffOnlySelect
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
    <UnitSelectWithStaffSelectOnly
      v-for="(subUnit, index) in unit?.subUnits"
      :key="index"
      :form-name
      :is-select-multiple
      :disabled
      :level="level + 1"
      :unit="subUnit"
      v-model="modelValue"
      :isDefaultExpandAll
      :checkIfStaffDisabled
      @unit-click="(unit) => emits('unit-click', unit)"
      @staff-select="(staff) => emits('staff-select', staff)"
      @staff-unselect="(staff) => emits('staff-unselect', staff)"
    />
  </template>
</template>
