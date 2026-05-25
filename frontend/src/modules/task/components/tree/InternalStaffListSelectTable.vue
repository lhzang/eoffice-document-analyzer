<script setup lang="ts">
import { useActionGetListStaffsInUnit } from '@/modules/organization/composables/queries/useActionGetListStaffsInUnit'
import UnitSelectWithStaffListSelectOnly from '@/modules/task/components/tree/UnitSelectWithStaffListSelectOnly.vue'
import { useGetAllInternalUnitWithStaff } from '@/shared/composables/queries/organization/unit/useGetAllInternalUnitWithStaff'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import { useQueryClient } from '@tanstack/vue-query'
import { ref } from 'vue'
import {
  formatAdminStaffDataForTreeInput,
  updateStaffDataOnlyToNodeOfForest
} from '../../../../shared/utils/organization/unit'

type TProps = {
  isDefaultValueReadOnly?: boolean
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
}
const props = defineProps<TProps>()
const selectedStaffs = defineModel<TStaffSelectValue[] | null>({
  required: true
})

const successFetchedUnit = ref(new Set())

const { data: unitForest, isLoading: isGettingUnitsData } = useGetAllInternalUnitWithStaff()
const { mutate: triggerFetchStaff, isPending: isGettingStaffs } = useActionGetListStaffsInUnit()
const queryClient = useQueryClient()

//fetch staff and mark as fetched, prevent extra fetch
const handleFetchStaffInUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    unit?.isGroup ||
    successFetchedUnit.value.has(`${unit?.id}_${unit.rootNodeId}`) ||
    unit?.relativeLevel === 0
  )
    return
  else {
    triggerFetchStaff(
      { unitId: unit?.id },
      {
        onSuccess: (staffList) => {
          successFetchedUnit.value?.add(`${unit?.id}_${unit.rootNodeId}`)
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
                    )
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

const handleCheckIfUnitDisabled = (unit: TTreeUnitWithStaffNode): boolean => {
  const isFetched =
    successFetchedUnit.value.has(`${unit?.id}_${unit.rootNodeId}`) || unit?.relativeLevel === 0
  const hasNoStaff = !unit?.staffs?.length
  if (isFetched && hasNoStaff) return true
  return typeof props.checkIfUnitDisabled === 'function' ? props.checkIfUnitDisabled(unit) : false
}
</script>
<template>
  <div class="bg-primary mt-4 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
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
      v-if="!unitForest?.length && !isGettingUnitsData"
      class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
    >
      <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
      <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
    </div>
    <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
      <UnitSelectWithStaffListSelectOnly
        v-for="(unitTree, idx) in unitForest"
        :key="idx"
        form-name="user"
        :unit="unitTree"
        v-model="selectedStaffs"
        @unit-click="handleFetchStaffInUnit"
        :check-if-staff-disabled="props.checkIfStaffDisabled"
        :check-if-unit-disabled="handleCheckIfUnitDisabled"
      />
    </div>
  </div>
</template>
