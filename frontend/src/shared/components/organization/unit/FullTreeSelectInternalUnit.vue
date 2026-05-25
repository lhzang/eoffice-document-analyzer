<script setup lang="ts" generic="TIsMultiple extends boolean">
import type { TTreeUnitWithStaffNode, TUnitSelectValue } from '@/shared/models/organization/unit'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref, toRaw, watch, watchEffect } from 'vue'
import { useGetTreeInternalUnit } from '../../../composables/queries/organization/unit/useGetAllInternalUnit'
import { filterTreeNodeByName } from '../../../utils/organization/unit'
import UnitSelect from './UnitSelect.vue'

type TProps = {
  // isDefaultValueReadOnly?: boolean
  isSelectMultiple: TIsMultiple
  showSearch?: boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
  isPreventSelectGroup?: boolean
}

const emits = defineEmits<{
  'unit-select': [TTreeUnitWithStaffNode]
  'unit-unselect': [TTreeUnitWithStaffNode]
}>()

const {
  isSelectMultiple,
  showSearch = true,
  checkIfUnitDisabled,
  isPreventSelectGroup
} = defineProps<TProps>()
const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal?.trim()
}, 300)
const selectedUnit = defineModel<
  (TIsMultiple extends false ? TUnitSelectValue : TUnitSelectValue[]) | null
>({
  required: true
})

const { data: unitForest, isLoading: isGettingUnitsData } = useGetTreeInternalUnit()

const filteredListInternalUnitForest = computed(() => {
  const filterForest: TTreeUnitWithStaffNode[] = []
  if (unitForest.value && unitForest.value?.length) {
    for (const unitTree of unitForest?.value) {
      const filterTreeNode = filterTreeNodeByName(unitTree, true, debouncedSearchValue.value)
      if (filterTreeNode) filterForest.push(filterTreeNode)
    }
  }
  return filterForest
})
watchEffect(() => {
  console.log(toRaw(unitForest.value), 'unitForest')
})
watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>
<template>
  <div>
    <div class="mt-4 mb-2 flex items-center justify-center" v-if="showSearch">
      <div
        class="custom-input border-surface-300 inline-flex h-10 w-full items-center rounded-md border bg-white px-2 py-1"
      >
        <span
          class="custom-input--icon__search shrink-0 pl-2 text-2xl text-gray-500"
          :class="'icon-[line-md--search]'"
        />
        <input
          ref="searchInputRef"
          class="w-full border-none px-2 py-1 outline-none"
          placeholder="Tìm kiếm"
          v-model="searchValue"
        />
        <span
          v-if="searchValue"
          class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
          :class="'icon-[line-md--close-circle-filled]'"
          @click="searchValue = ''"
        />
      </div>
    </div>
    <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
      <div class="item flex-1">Đơn vị</div>
      <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
    </div>
    <div class="relative">
      <div
        v-if="isGettingUnitsData"
        class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center"
      >
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div
        v-if="!filteredListInternalUnitForest?.length"
        class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
      >
        <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
        <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
      </div>
      <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
        <UnitSelect
          v-for="(unitTree, idx) in filteredListInternalUnitForest"
          :key="idx"
          form-name="user"
          :isSelectMultiple="isSelectMultiple"
          :unit="unitTree"
          v-model="selectedUnit"
          :check-if-unit-disabled="checkIfUnitDisabled"
          :isDefaultExpandAll="!!debouncedSearchValue.trim()"
          :isPreventSelectGroup="isPreventSelectGroup"
          @unit-select="(unit) => emits('unit-select', unit)"
          @unit-unselect="(unit) => emits('unit-unselect', unit)"
        />
      </div>
    </div>
  </div>
</template>
