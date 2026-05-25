<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import { useGetPermissionsInUnit } from '@/shared/composables/queries/accessControl/useGetPermissionsInUnit'
import { useGetDetailUnit } from '@/shared/composables/queries/organization/unit/useGetDetailUnit'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { computed, ref } from 'vue'
import AddStaffIntoUnit from './AddStaffIntoUnit.vue'
import AddUnitIntoUnit from './AddUnitIntoUnit.vue'
import CreateUnitGroupInfo from './CreateUnitGroupInfo.vue'
import UnitInfo from './UnitInfo.vue'

const props = defineProps<{
  unitId: string
  unitTreeData: TTreeUnitWithStaffNode
}>()

const emit = defineEmits<{
  (e: 'unitHandled'): void
}>()

const {
  data: detailData,
  isLoading: isGettingUnit,
  error: getDetailUnitError
} = useGetDetailUnit(() => props.unitId)
const {
  data: permissionInUnit,
  isLoading: isGettingPermission,
  error: errorWhenGetPerm
} = useGetPermissionsInUnit(() => props.unitId!, {
  enabled: () => !!props.unitId
})

const hasManageUnitPermission = computed(() =>
  (permissionInUnit?.value ?? [])?.includes(APP_PERMISSION_VALUES.manageUnit)
)

const tabList = computed(() => {
  const checkedTabList = [
    {
      label: 'Chỉnh sửa',
      value: 'info'
    }
  ]
  if (permissionInUnit?.value?.includes(APP_PERMISSION_VALUES.manageUnit))
    checkedTabList.push({
      label: 'Thêm đơn vị',
      value: 'addUnit'
    })
  if (permissionInUnit?.value?.includes(APP_PERMISSION_VALUES.createPosition))
    checkedTabList.push({
      label: 'Thêm nhân sự',
      value: 'addStaff'
    })
  if (permissionInUnit?.value?.includes(APP_PERMISSION_VALUES.createUnitGroup))
    checkedTabList.push({
      label: 'Thêm khối đơn vị',
      value: 'addUnitGroup'
    })
  return checkedTabList
})
const selectTab = ref('info')
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <!-- v-if="isGettingUnit || isGettingPermission" -->
    <div
      v-if="isGettingUnit || isGettingPermission"
      class="relative flex h-full items-center justify-center"
    >
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div
      v-else-if="getDetailUnitError || errorWhenGetPerm"
      class="border-shadow relative flex h-full items-center justify-center"
    >
      {{
        getDetailUnitError?.response?.data?.detail ??
        getDetailUnitError?.message ??
        errorWhenGetPerm?.response?.data?.detail ??
        errorWhenGetPerm?.message ??
        'Có lỗi khi lấy thông tin đơn vị'
      }}
    </div>
    <div v-else class="flex h-full w-full flex-col">
      <div>
        <AppTabs class="w-full" scrollable v-model="selectTab" :tab-list="tabList" />
      </div>
      <div class="flex-1 overflow-auto border-t border-gray-200 p-4">
        <UnitInfo
          v-if="detailData && selectTab === 'info'"
          :hasManageUnitPermission
          :unitTreeData
          :unit-details="detailData"
          :unit-id="unitId"
          @unit-handled="emit('unitHandled')"
        />

        <AddStaffIntoUnit
          v-if="detailData && selectTab === 'addStaff'"
          :parent-unit-id="props?.unitId"
          :unit-details="detailData"
          :unitTreeData
          @added-user="emit('unitHandled')"
        />

        <AddUnitIntoUnit
          v-if="detailData && selectTab === 'addUnit'"
          :permissionInUnit="permissionInUnit ?? []"
          :parent-name="detailData.name"
          :parent-id="unitId"
          @unit-handled="emit('unitHandled')"
        />

        <CreateUnitGroupInfo v-if="selectTab === 'addUnitGroup'" :parent-unit-id="props?.unitId" />
      </div>
    </div>
  </div>
</template>
