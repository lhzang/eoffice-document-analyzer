<script setup lang="ts" generic="TIsMultiple extends boolean">
import { Checkbox, RadioButton } from 'primevue'
import { markRaw, toRaw } from 'vue'
import type { TStaffSelectValue, TTreeStaffNodeNew } from '../../../models/organization/unit'
//type
type TProps = {
  formName: string
  staff: TTreeStaffNodeNew
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  isSelectMultiple: TIsMultiple
  disabled?: boolean
  level: number
}

const emits = defineEmits<{
  'staff-select': [TStaffSelectValue]
  'staff-unselect': [TStaffSelectValue]
}>()

//props
const {
  formName,
  isSelectMultiple,
  staff,
  disabled = false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()

//reactive

const modelValue = defineModel<
  (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
>()

const handleCheckboxToggle = (toggleItem: TStaffSelectValue[], item: TStaffSelectValue) => {
  if (toggleItem?.length) {
    modelValue.value = [
      ...((modelValue.value as TStaffSelectValue[]) ?? []).map((value) => markRaw(toRaw(value))),
      item
    ] as TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]
    emits('staff-select', staff)
  } else {
    modelValue.value = (modelValue.value as TStaffSelectValue[])!.filter(
      (value) => value.positionId !== (item as TStaffSelectValue).positionId
    ) as TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]
    emits('staff-unselect', staff)
  }
}

const handleRadioValueChange = (selectedValue: TStaffSelectValue) => {
  if (selectedValue) {
    modelValue.value = selectedValue as TIsMultiple extends false
      ? TStaffSelectValue
      : TStaffSelectValue[]
    emits('staff-select', staff)
  }
}

// allow radio button can be unselect
const handleClickRadio = (e: MouseEvent) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value = null
    emits('staff-unselect', staff)
  }
}
</script>
<template>
  <div
    :class="`border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
  >
    <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 12}px` }">
      <span :class="'ml-[24px] truncate'">{{ staff?.displayName }}</span>
    </div>
    <div class="flex h-auto w-10 shrink-0 items-center justify-center">
      <Checkbox
        v-if="isSelectMultiple"
        :name="formName"
        :model-value="
          (modelValue as TStaffSelectValue[])?.find(
            (value) => value.positionId === staff.positionId
          )
            ? [staff]
            : []
        "
        @update:modelValue="(checked) => handleCheckboxToggle(checked, staff)"
        :value="staff"
        :disabled="checkIfStaffDisabled(staff)"
        @click.stop
      ></Checkbox>
      <RadioButton
        v-else
        :name="formName"
        v-model="modelValue"
        @update:modelValue="handleRadioValueChange"
        :value="staff"
        :disabled="checkIfStaffDisabled(staff)"
        @click.stop="handleClickRadio"
      ></RadioButton>
    </div>
  </div>
</template>
