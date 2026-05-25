<script setup lang="ts">
import type { TStaffSelectValue, TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import { Checkbox } from 'primevue'
import { computed, markRaw, toRaw } from 'vue'
//type
type TProps = {
  formName: string
  staff: TTreeStaffNodeNew
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  disabled?: boolean
  level: number
}

//props
const {
  formName,
  staff,
  disabled = false,
  checkIfStaffDisabled = () => false
} = defineProps<TProps>()

//reactive

const modelValue = defineModel<TStaffSelectValue[] | null>()

const isGroupNode = computed(() => Boolean((staff as { isGroup?: boolean })?.isGroup))

const handleCheckboxToggle = (toggleItem: TStaffSelectValue[], item: TStaffSelectValue) => {
  if (toggleItem?.length) {
    modelValue.value = [...(modelValue.value ?? []).map((value) => markRaw(toRaw(value))), item]
  } else {
    modelValue.value = (modelValue.value ?? []).filter(
      (value) => value.positionId !== item.positionId
    )
  }
}
</script>
<template>
  <div
    v-if="!isGroupNode"
    :class="`text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`"
  >
    <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 12}px` }">
      <span>{{ staff?.displayName }}</span>
    </div>
    <div class="flex h-auto w-10 shrink-0 items-center justify-center">
      <Checkbox
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
    </div>
  </div>
</template>
