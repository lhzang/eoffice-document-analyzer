<script setup lang="ts" generic="TIsMultiple extends boolean">
import type { TDocumentProcessRole } from '@/shared/constants/document'
import type { TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import type {
  TFormDestinationProcessRoleInput,
  TFormSelectDestinationValue,
  TFormSelectDestinationValues,
  TStaffDestinationSelect
} from '@/shared/models/outDoc/destination'
import { formatSelectValueForInternalStaff } from '@/shared/utils/outDoc/destination'
import { Checkbox, RadioButton } from 'primevue'
import { computed, nextTick } from 'vue'
//type
type TProps = {
  formInputList: TFormDestinationProcessRoleInput[]
  readOnlySelectedDestinations?: TFormSelectDestinationValues
  checkIfStaffDisabled?: (staff: TStaffDestinationSelect) => boolean
  staff: TTreeStaffNodeNew
  disabled?: boolean
  level?: number
  selectedCheckedReadOnlyInputs: Set<TDocumentProcessRole>
}

//props
const {
  formInputList,
  checkIfStaffDisabled = () => false,
  staff,
  readOnlySelectedDestinations = new Map<string, TFormSelectDestinationValue>(),
  disabled = false,
  level = 0,
  selectedCheckedReadOnlyInputs = new Set()
} = defineProps<TProps>()

const emits = defineEmits<{
  'staff-select': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
  'staff-unselect': [TTreeStaffNodeNew, TFormDestinationProcessRoleInput]
}>()
//reactive
const modelValue = defineModel<TFormSelectDestinationValues>()
const itemValue = computed(() => formatSelectValueForInternalStaff(staff))
const handleCheckboxValueChange = async (
  selectedValue: TFormSelectDestinationValue[],
  formInput: TFormDestinationProcessRoleInput
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
  selectedValue: TFormSelectDestinationValue,
  formInput: TFormDestinationProcessRoleInput
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
const handleClickRadio = async (e: MouseEvent, formInput: TFormDestinationProcessRoleInput) => {
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
            readOnlySelectedDestinations.get(staff.positionId)?.formName === formInput.name ||
            modelValue?.get(staff.positionId)?.formName === formInput.name
              ? [
                  modelValue?.get(staff.positionId) ??
                    readOnlySelectedDestinations?.get(staff.positionId)
                ]
              : []
          "
          @update:modelValue="
            (selectdValue: TFormSelectDestinationValue[]) =>
              handleCheckboxValueChange(selectdValue, formInput)
          "
          :value="{
            ...itemValue,
            formName: formInput.name
          }"
          :disabled="
            checkIfStaffDisabled(formatSelectValueForInternalStaff(staff)) ||
            readOnlySelectedDestinations.has(staff?.positionId)
          "
          @click.stop
        ></Checkbox>
        <RadioButton
          v-else
          :name="formInput.name"
          :model-value="
            readOnlySelectedDestinations.get(staff.positionId)?.formName === formInput.name ||
            modelValue?.get(staff.positionId)?.formName === formInput.name
              ? (modelValue?.get(staff.positionId) ??
                readOnlySelectedDestinations?.get(staff.positionId))
              : null
          "
          @update:modelValue="
            (selectdValue: TFormSelectDestinationValue) =>
              handleRadioValueChange(selectdValue, formInput)
          "
          :value="{
            ...itemValue,
            formName: formInput.name
          }"
          :disabled="
            readOnlySelectedDestinations.has(staff?.positionId) ||
            checkIfStaffDisabled(formatSelectValueForInternalStaff(staff)) ||
            selectedCheckedReadOnlyInputs?.has(formInput.name)
          "
          @click.stop="(e: MouseEvent) => handleClickRadio(e, formInput)"
        ></RadioButton>
      </div>
    </div>
  </div>
</template>
