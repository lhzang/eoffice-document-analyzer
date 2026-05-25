<script setup lang="ts" generic="TIsMultiple extends boolean">
import type { TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import type { TSigner } from '@/shared/models/outDoc/signer'
import { extractSignerValueFromStaffNode } from '@/shared/utils/outDoc/signer'
import { Checkbox, RadioButton } from 'primevue'
import { computed, markRaw, toRaw } from 'vue'
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
  'staff-select': [TSigner]
  'staff-unselect': [TSigner]
}>()

//props
const {
  formName,
  isSelectMultiple,
  staff,
  disabled = false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()

const itemValue = computed(() => extractSignerValueFromStaffNode(staff))

//reactive

const modelValue = defineModel<(TIsMultiple extends false ? TSigner : TSigner[]) | null>()

const handleCheckboxToggle = (toggleItem: TSigner[], item: TSigner) => {
  if (toggleItem?.length) {
    modelValue.value = [
      ...((modelValue.value as TSigner[]) ?? []).map((value) => markRaw(toRaw(value))),
      item
    ] as TIsMultiple extends false ? TSigner : TSigner[]
    emits('staff-select', item)
  } else {
    modelValue.value = (modelValue.value as TSigner[])!.filter(
      (value) => value.positionId !== (item as TSigner).positionId
    ) as TIsMultiple extends false ? TSigner : TSigner[]
    emits('staff-unselect', item)
  }
}

const handleRadioValueChange = (selectedValue: TSigner) => {
  if (selectedValue) {
    modelValue.value = selectedValue as TIsMultiple extends false ? TSigner : TSigner[]
    emits('staff-select', selectedValue)
  }
}

// allow radio button can be unselect
const handleClickRadio = (e: MouseEvent) => {
  if ((e.target as HTMLInputElement).checked) {
    modelValue.value = null
    emits('staff-unselect', itemValue.value)
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
          (modelValue as TSigner[])?.find((value) => value.positionId === itemValue.positionId)
            ? [itemValue]
            : []
        "
        @update:modelValue="(checked) => handleCheckboxToggle(checked, itemValue)"
        :value="itemValue"
        :disabled="checkIfStaffDisabled(staff)"
        @click.stop
      ></Checkbox>
      <RadioButton
        v-else
        :name="formName"
        v-model="modelValue"
        @update:modelValue="handleRadioValueChange"
        :value="itemValue"
        :disabled="checkIfStaffDisabled(staff)"
        @click.stop="handleClickRadio"
      ></RadioButton>
    </div>
  </div>
</template>
