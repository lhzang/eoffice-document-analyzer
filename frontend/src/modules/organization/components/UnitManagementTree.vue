<script setup lang="ts">
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import {
  formatInAllUnitStaffDataForTreeInput,
  updateStaffDataOnlyToNodeOfForest
} from '@/shared/utils/organization/unit'
import { useQueryClient } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import { useActionGetListStaffsInUnit } from '../composables/queries/useActionGetListStaffsInUnit'
import { useGetUnitTreeForManagement } from '../composables/queries/useGetUnitTreeForManagement'
import SimpleUnitTree from './SimpleUnitTree.vue'
import StaffEditForm from './StaffEditForm.vue'
import UnitConfig from './UnitConfig.vue'
import UnitGroup from './UnitGroup.vue'

const {
  data: unitForestData,
  isLoading: isGettingUnitsData,
  isError,
  isSuccess,
  error
} = useGetUnitTreeForManagement()

// Extract unitTrees and rootUnitStaff from the response
const initialUnitForestData = ref<TTreeUnitWithStaffNode[]>([])
const { mutate: triggerFetchStaff, isPending: isGettingStaffs } = useActionGetListStaffsInUnit()

const queryClient = useQueryClient()

const successFetchedUnit = new Set<string>()
const expandedUnits = ref(new Set<string>())

const selectedStaff = ref<TTreeStaffNodeNew | null>(null)
const selectedUnit = ref<TTreeUnitWithStaffNode | null>(null)

const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {
  if (!unit.isRoleGroup) {
    selectedStaff.value = null
    selectedUnit.value = unit
  }
}

watch([isSuccess, unitForestData], ([fetchSuccess, data]) => {
  if (fetchSuccess && data) {
    initialUnitForestData.value = data
  }
})

const handleExpandUnit = (unit: TTreeUnitWithStaffNode) => {
  expandedUnits.value.add(unit.id)
  // handleFetchStaffInUnit(unit)
}

const handleCollapseUnit = (unit: TTreeUnitWithStaffNode) => {
  expandedUnits.value.delete(unit.id)
}

const handleStaffClick = (staff: TTreeStaffNodeNew) => {
  selectedUnit.value = null
  selectedStaff.value = staff
}

// Fetch staff and prevent duplicate calls
const handleFetchStaffInUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    unit?.isGroup ||
    successFetchedUnit.has(`${unit?.id}_${unit.rootNodeId}`) ||
    unit?.relativeLevel === 0
  ) {
    return
  } else {
    triggerFetchStaff(
      { unitId: unit?.id },
      {
        onSuccess: (staffList) => {
          successFetchedUnit?.add(`${unit?.id}_${unit.rootNodeId}`)

          if (unitForestData?.value) {
            queryClient.setQueryData(
              ['getUnitTreeForManagement', undefined],
              (oldData: TTreeUnitWithStaffNode[] | undefined) => {
                if (!oldData) return oldData

                const newForest = updateStaffDataOnlyToNodeOfForest(
                  [...oldData],
                  unit,
                  formatInAllUnitStaffDataForTreeInput(staffList, unit?.id)
                )

                return newForest
              }
            )
          }
        }
      }
    )
  }
}

const handleUnitHandled = () => {
  selectedUnit.value = null
  selectedStaff.value = null

  expandedUnits.value.clear()
  successFetchedUnit.clear()

  queryClient.invalidateQueries({
    queryKey: ['getUnitTreeForManagement']
  })
  queryClient.removeQueries({ queryKey: ['getDetailUnit'] })
}
</script>

<template>
  <div class="unit-management-tree flex h-full w-full gap-4">
    <!-- Left panel: Tree view -->
    <div
      class="shadow-[0px_12px_24px_-4px_#919EAB33]"
      :class="[
        'flex flex-col border border-gray-200',
        selectedStaff || selectedUnit ? 'w-1/2' : 'w-full'
      ]"
    >
      <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
        <div class="item flex-1">Đơn vị</div>
      </div>

      <div class="relative flex-1 overflow-hidden">
        <div v-if="isError" class="flex h-full items-center justify-center">
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <div class="flex items-center gap-2 text-red-600">
              <span class="icon-[material-symbols--error-outline] text-xl"></span>
              <span class="font-medium">Lỗi khi tải dữ liệu</span>
            </div>
            <p class="mt-1 text-sm text-red-500">
              {{ error?.message || 'Có lỗi xảy ra khi tải cây đơn vị' }}
            </p>
          </div>
        </div>

        <div v-else class="relative h-full overflow-auto bg-gray-50">
          <div
            v-if="isGettingStaffs || isGettingUnitsData"
            class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center"
          >
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
          <div
            v-if="!unitForestData || unitForestData.length === 0"
            class="flex h-[200px] items-center justify-center"
          >
            <div class="flex flex-col items-center gap-2">
              <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
              <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
            </div>
          </div>
          <SimpleUnitTree
            v-else
            v-for="unitTree in unitForestData"
            :key="unitTree.id"
            :unit="unitTree"
            :isDefaultExpandAll="false"
            :expandedUnits="expandedUnits"
            @unit-click="handleUnitClick"
            @expand="handleExpandUnit"
            @collapse="handleCollapseUnit"
            @staff-click="handleStaffClick"
          />
        </div>
      </div>
    </div>

    <!-- Right panel: Edit form -->
    <div v-if="selectedStaff || selectedUnit" class="flex w-1/2 flex-col border border-gray-200">
      <StaffEditForm
        v-if="selectedStaff"
        :key="`${selectedStaff?.positionId}_${selectedStaff?.parentUnit?.id}`"
        :accountId="selectedStaff.accountId"
        :parentUnit="selectedStaff?.parentUnit"
        @updated-staff="selectedStaff = null"
      />
      <UnitGroup
        v-if="selectedUnit && selectedUnit?.isGroup && !selectedUnit?.isRoleGroup"
        :unitDetails="selectedUnit"
        @group-unit-handled="handleUnitHandled"
      />
      <UnitConfig
        v-if="selectedUnit && !selectedUnit?.isGroup && !selectedUnit?.isRoleGroup"
        :unitId="selectedUnit?.id"
        :unitTreeData="selectedUnit"
        @unit-handled="handleUnitHandled"
      />
    </div>
  </div>
</template>
