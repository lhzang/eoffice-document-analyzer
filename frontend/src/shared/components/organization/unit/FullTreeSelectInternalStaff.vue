<script setup lang="ts" generic="TIsMultiple extends boolean">
import { useActionGetListStaffsInUnit } from '@/modules/organization/composables/queries/useActionGetListStaffsInUnit'
import { useGetAllInternalUnitWithStaff } from '@/shared/composables/queries/organization/unit/useGetAllInternalUnitWithStaff'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { TStaffLeaderFilterMode } from '@/shared/models/common'
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import { useQueryClient } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import {
  filterTreeNodeByName,
  formatAdminStaffDataForTreeInput,
  updateStaffDataOnlyToNodeOfForest
} from '../../../utils/organization/unit'
import UnitSelectWithStaffSelectOnly from './UnitSelectWithStaffSelectOnly.vue'

type TProps = {
  isDefaultValueReadOnly?: boolean
  isSelectMultiple: TIsMultiple
  //decide if tree that render should be contain leader only or not
  filterLeaderMode?: TStaffLeaderFilterMode
  //filter staff that has global permission
  permissionFilter?: TAppFeatureKey
  showSearch?: boolean
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
}

const emits = defineEmits<{
  'staff-select': [TStaffSelectValue]
  'staff-unselect': [TStaffSelectValue]
}>()

const props = defineProps<TProps>()
const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 300)
const selectedStaffs = defineModel<
  (TIsMultiple extends false ? TStaffSelectValue : TStaffSelectValue[]) | null
>({
  required: true
})

const successFetchedUnit = new Set()

const { data: unitForest, isLoading: isGettingUnitsData } = useGetAllInternalUnitWithStaff(
  () => props?.filterLeaderMode,
  () => props?.permissionFilter,
  { structuralSharing: false }
)
const { mutate: triggerFetchStaff, isPending: isGettingStaffs } = useActionGetListStaffsInUnit()
const queryClient = useQueryClient()

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

//fetch staff and mark as fetched, prevent extra fetch
const handleFetchStaffInUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    unit?.isGroup ||
    successFetchedUnit.has(`${unit?.id}_${unit.rootNodeId}`) ||
    unit?.relativeLevel === 0
  )
    return
  else {
    triggerFetchStaff(
      { unitId: unit?.id },
      {
        onSuccess: (staffList) => {
          successFetchedUnit?.add(`${unit?.id}_${unit.rootNodeId}`)
          if (unitForest?.value) {
            queryClient.setQueryData(
              ['getAllTreeInternalWithStaff'],
              (oldData: TTreeUnitWithStaffNode[] | undefined) => {
                if (!oldData) return oldData

                const newData = updateStaffDataOnlyToNodeOfForest(
                  [...oldData],
                  unit,
                  formatAdminStaffDataForTreeInput(
                    staffList?.filter(
                      (staff) => staff?.positions?.[0]?.roleInUnit !== ROLE_IN_UNIT_VALUES.admin
                    ),
                    props?.filterLeaderMode
                  )
                )
                return newData
              }
            )
          }
        }
      }
    )
  }
}

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>
<template>
  <div>
    <div class="mt-4 flex items-center justify-center" v-if="props?.showSearch">
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
        v-if="isGettingStaffs || isGettingUnitsData"
        class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-[rgba(204,204,204,0.1)]"
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
        <UnitSelectWithStaffSelectOnly
          v-for="(unitTree, idx) in filteredListInternalUnitForest"
          :key="idx"
          form-name="user"
          :isSelectMultiple="isSelectMultiple"
          :unit="unitTree"
          v-model="selectedStaffs"
          :isDefaultExpandAll="!!debouncedSearchValue.trim()"
          @unit-click="handleFetchStaffInUnit"
          @staff-select="(staff) => emits('staff-select', staff)"
          @staff-unselect="(staff) => emits('staff-unselect', staff)"
          :check-if-staff-disabled="props.checkIfStaffDisabled"
        />
      </div>
    </div>
  </div>
</template>
