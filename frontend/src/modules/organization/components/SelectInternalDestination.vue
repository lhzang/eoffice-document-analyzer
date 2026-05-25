<script setup lang="ts">
import UnitSelect from '@/shared/components/organization/unit/UnitSelect.vue'
import type { TSelectedInternalUnit } from '@/shared/models/organization/unit'
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'

type TProps = {
  isDefaultValueReadOnly?: boolean
  formName: string
  isSelectMultiple: boolean
}

const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 300)
const selectedUnit = defineModel<TSelectedInternalUnit | TSelectedInternalUnit[] | null>()

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>
<template>
  <div class="flex items-center justify-center">
    <div
      class="custom-input border-surface-300 inline-flex h-10 w-full items-center rounded-sm border bg-white px-2 py-1"
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
  <div class="bg-primary mt-4 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
    <div class="item flex-1">Đơn vị</div>
    <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
  </div>
  <div class="relative h-[400px] min-h-[200px] overflow-auto">
    <UnitSelect
      form-name="user"
      :isSelectMultiple="true"
      :level="mockUnitData?.level"
      :unit="mockUnitData"
      v-model="selectedUnit"
    />
  </div>
</template>
