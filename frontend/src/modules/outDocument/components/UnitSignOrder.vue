<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import { remapAccendingSequentialIndexes } from '@/shared/utils/common'
import { Checkbox } from 'primevue'
import { computed } from 'vue'
import type { TJointUnitSelectValue } from '../models/document'

const unitList = defineModel<TJointUnitSelectValue[]>({
  required: true
})
const maxOrder = computed(() => {
  if (!unitList?.value?.length) return 1
  const lastIndex = unitList?.value?.[unitList?.value?.length - 1]?.index
  return Math.min((lastIndex ?? 0) + 1, unitList?.value?.length)
})

const emits = defineEmits<{
  'unit-removed': [TJointUnitSelectValue]
}>()

const isUnOrder = defineModel<boolean>('isUnOrder', {
  default: false
})

const handleUpdateSignOrder = (isUnOrder: boolean) => {
  if (isUnOrder) unitList?.value?.forEach((unit) => (unit.index = 1))
  else unitList?.value?.forEach((unit, idx) => (unit.index = idx + 1))
}
</script>
<template>
  <div>
    <div class="bg-primary flex h-10 items-center justify-end gap-1 px-4 py-2 font-bold text-white">
      <div class="flex items-center justify-center gap-2">
        Ký theo trình tự bất kỳ
        <div class="mr-px flex h-auto shrink-0 items-center justify-center">
          <Checkbox
            v-model="isUnOrder"
            binary
            @update:model-value="handleUpdateSignOrder"
          ></Checkbox>
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        v-if="!unitList?.length"
        class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
      >
        <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
        <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
      </div>
      <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
        <div
          :class="`mb-1 flex h-10 cursor-pointer items-center gap-1 bg-white px-4 py-2 font-semibold shadow-[0px_12px_24px_-4px_#919EAB33]`"
          v-for="(unit, idx) in unitList"
          :key="idx"
        >
          <div class="flex flex-1 items-center gap-2 truncate">
            <span
              @click="emits('unit-removed', unit)"
              class="icon-[streamline--recycle-bin-2-remix] shrink-0 text-red-500"
            ></span>
            <div class="w-full truncate">{{ unit?.unit?.name }}</div>
          </div>
          <div class="flex h-auto shrink-0 items-center justify-center">
            <AppNumberInput
              class="w-6"
              inputClass="text-center p-0! h-6! w-6!"
              inputContainerClass="h-6 w-6"
              :name="`signOrder_${unit?.unit?.id}`"
              :min="1"
              :max="maxOrder"
              :disabled="isUnOrder"
              :allow-empty="true"
              :invalid="unit.index === null"
              @change="
                (value) => {
                  if (value === null) unit.index = 1
                  else unit.index = value
                  const normalizedValues = remapAccendingSequentialIndexes(unitList, 'index')
                  unitList = normalizedValues
                }
              "
              :model-value="unit?.index"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
