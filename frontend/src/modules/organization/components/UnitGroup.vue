<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import { useGetPermissionsInUnit } from '@/shared/composables/queries/accessControl/useGetPermissionsInUnit'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { computed, ref } from 'vue'
import AddUnitIntoUnit from './AddUnitIntoUnit.vue'
import UpdateUnitGroupInfo from './UpdateUnitGroupInfo.vue'

const { unitDetails } = defineProps<{
  unitDetails: TTreeUnitWithStaffNode
}>()
const {
  data: permissionInUnit,
  isLoading: isGettingPermission,
  error: errorWhenGetPerm
} = useGetPermissionsInUnit(() => unitDetails?.parentUnit?.id!, {
  enabled: () => !!unitDetails?.parentUnit?.id
})
const hasDeleteGroupPermission = computed(() =>
  (permissionInUnit?.value ?? [])?.includes(APP_PERMISSION_VALUES.deleteUnitGroup)
)
const hasUpdateGroupPermission = computed(() =>
  (permissionInUnit?.value ?? [])?.includes(APP_PERMISSION_VALUES.updateUnitGroup)
)

const tabList = computed(() => {
  if (permissionInUnit?.value?.includes(APP_PERMISSION_VALUES.manageUnit))
    return [
      {
        label: 'Chỉnh sửa',
        value: 'info'
      },
      {
        label: 'Thêm đơn vị',
        value: 'addUnit'
      }
    ]
  return [
    {
      label: 'Chỉnh sửa',
      value: 'info'
    }
  ]
})

const emit = defineEmits<{
  (e: 'groupUnitHandled'): void
}>()

const selectTab = ref('info')
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <div v-if="isGettingPermission" class="relative flex h-full items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div
      v-else-if="errorWhenGetPerm"
      class="border-shadow relative flex h-full items-center justify-center"
    >
      {{
        errorWhenGetPerm?.response?.data?.detail ??
        errorWhenGetPerm?.message ??
        'Có lỗi khi lấy thông tin'
      }}
    </div>
    <div v-else class="flex h-full w-full flex-col">
      <div class="text-white">
        <AppTabs class="w-full" v-model="selectTab" :tab-list="tabList" />
      </div>
      <div class="flex-1 overflow-auto border-t border-gray-200 p-4">
        <UpdateUnitGroupInfo
          v-if="selectTab === 'info'"
          :unit-details
          :hasDeleteGroupPermission
          :hasUpdateGroupPermission
          @group-unit-handled="emit('groupUnitHandled')"
        />
        <AddUnitIntoUnit
          v-if="selectTab === 'addUnit' && unitDetails.parentUnit"
          :group-id="unitDetails.id"
          :group-name="unitDetails.name"
          :is-group="true"
          :parent-id="unitDetails.parentUnit.id"
          :parent-name="unitDetails.parentUnit.name"
          @unit-handled="emit('groupUnitHandled')"
        />
      </div>
    </div>
  </div>
</template>
