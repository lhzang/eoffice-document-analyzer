<script setup lang="ts" generic="TIsMultiple extends boolean">
import { RECEIVER_TYPES } from '@/shared/constants/document'
import type { TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import { Checkbox, RadioButton } from 'primevue'
import { computed, nextTick } from 'vue'
import type {
  TFormSelectDistribute,
  TFormSelectDistributeItemValue,
  TFormSelectDistributeItemValues,
  TSelectStaffDistributeValue
} from '../../models/types'
import { formatSelectValueForStaff } from '../../utils/distributeUtils'
//type
type TProps = {
  formInputList: TFormSelectDistribute[]
  checkIfStaffDisabled?: (staff: TSelectStaffDistributeValue) => boolean
  staff: TTreeStaffNodeNew
  readOnlySelectedItems?: TFormSelectDistributeItemValues

  disabled?: boolean
  level?: number
}

//props
const {
  formInputList,
  checkIfStaffDisabled = () => false,
  staff,
  readOnlySelectedItems = new Map<string, TFormSelectDistributeItemValue>(),
  disabled = false,
  level = 0
} = defineProps<TProps>()

const emits = defineEmits<{
  'staff-select': [TTreeStaffNodeNew, TFormSelectDistribute]
  'staff-unselect': [TTreeStaffNodeNew, TFormSelectDistribute]
}>()
//reactive
const modelValue = defineModel<TFormSelectDistributeItemValues>()
const itemValue = computed(() => formatSelectValueForStaff(staff))
const handleCheckboxValueChange = async (
  selectedValue: TFormSelectDistributeItemValue[],
  formInput: TFormSelectDistribute
) => {
  if (selectedValue?.length) {
    modelValue.value?.set(staff.positionId, selectedValue[0]!)
    await nextTick()
    emits('staff-select', staff, formInput)
  } else {
    modelValue.value?.delete(staff.positionId)
    await nextTick()
    emits('staff-unselect', staff, formInput)
  }
}

const handleRadioValueChange = async (
  selectedValue: TFormSelectDistributeItemValue,
  formInput: TFormSelectDistribute
) => {
  if (selectedValue) {
    modelValue.value?.set(staff.positionId, selectedValue)
    await nextTick()
    emits('staff-select', staff, formInput)
  } else {
    modelValue.value?.delete(staff.positionId)
    await nextTick()
    emits('staff-unselect', staff, formInput)
  }
}

// allow radio button can be unselect
const handleClickRadio = async (e: MouseEvent, formInput: TFormSelectDistribute) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value?.delete(staff.positionId)
    await nextTick()
    emits('staff-unselect', staff, formInput)
  }
}
</script>
<template>
  <div
    :class="`border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-2 py-2 font-bold lg:px-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
  >
    <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 16}px` }">
      <div class="truncate" v-tippy="staff?.displayName">
        {{ staff?.displayName }}
      </div>
    </div>
    <div class="flex h-auto shrink-0 items-center justify-center gap-1">
      <div
        v-for="(formInput, idx) in formInputList"
        :key="idx"
        class="flex w-10 shrink-0 items-center justify-center lg:w-24"
      >
        <Checkbox
          v-if="formInput.type === 'checkbox'"
          :name="formInput.name"
          :model-value="
            readOnlySelectedItems?.get(staff.positionId)?.formName === formInput.name ||
            modelValue?.get(staff.positionId)?.formName === formInput.name
              ? [modelValue?.get(staff.positionId) ?? readOnlySelectedItems?.get(staff.positionId)]
              : []
          "
          @update:modelValue="
            (selectdValue: TFormSelectDistributeItemValue[]) =>
              handleCheckboxValueChange(selectdValue, formInput)
          "
          :value="{
            ...itemValue,
            formName: formInput.name
          }"
          :disabled="
            checkIfStaffDisabled({
              id: staff?.positionId,
              name: staff?.displayName,
              type: RECEIVER_TYPES.STAFF
            }) || readOnlySelectedItems?.has(staff.positionId)
          "
          @click.stop
        ></Checkbox>
        <RadioButton
          v-else
          :name="formInput.name"
          :model-value="
            readOnlySelectedItems?.get(staff.positionId)?.formName === formInput.name ||
            modelValue?.get(staff.positionId)?.formName === formInput.name
              ? (modelValue?.get(staff.positionId) ?? readOnlySelectedItems?.get(staff.positionId))
              : null
          "
          @update:modelValue="
            (selectdValue: TFormSelectDistributeItemValue) =>
              handleRadioValueChange(selectdValue, formInput)
          "
          :value="{
            ...itemValue,
            formName: formInput.name
          }"
          :disabled="
            checkIfStaffDisabled({
              id: staff?.positionId,
              name: staff?.displayName,
              type: RECEIVER_TYPES.STAFF
            }) || readOnlySelectedItems?.has(staff.positionId)
          "
          @click.stop="(e: MouseEvent) => handleClickRadio(e, formInput)"
        ></RadioButton>
      </div>
    </div>
  </div>
</template>
