<script setup lang="ts">
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { AccountDetailVM } from '@/shared/services/api'
import { computed } from 'vue'
import StaffDetailPosition from './StaffDetailPosition.vue'

type TProps = {
  staffDetail: AccountDetailVM
}

const emit = defineEmits<{
  (e: 'processedPosition'): void
}>()

const {
  data: hasUpdatePositionPermissionUnits,
  // isLoading: isGetttingHasUpdatePositionPermissionUnits,
  refetch: refetchGetHasUpdatePositionPermissionUnits
} = useGetAffectUnitBySelfPermission(
  () => APP_PERMISSION_VALUES.updatePosition,
  undefined,
  () => 'get-update-position'
)
const {
  data: hasDeletePositionPermissionUnits,
  // isLoading: isGetttingHasDeletePositionPermissionUnits,
  refetch: refetchGetHasDeletePositionPermissionUnits
} = useGetAffectUnitBySelfPermission(
  () => APP_PERMISSION_VALUES.deletePosition,
  undefined,
  () => 'get-delete-position'
)

const hasUpdatePositionPermissionUnitIds = computed(() =>
  (hasUpdatePositionPermissionUnits?.value ?? [])?.map((unit) => unit?.id)
)
const hasDeletePositionPermissionUnitIds = computed(() =>
  (hasDeletePositionPermissionUnits?.value ?? [])?.map((unit) => unit?.id)
)

const handleWhenPositionProcessed = () => {
  emit('processedPosition')
  refetchGetHasDeletePositionPermissionUnits()
  refetchGetHasUpdatePositionPermissionUnits()
}

const props = defineProps<TProps>()
</script>
<template>
  <div class="flex flex-col gap-6">
    <StaffDetailPosition
      v-for="(position, idx) in props?.staffDetail?.positions"
      :key="idx"
      :hasUpdatePositionPermissionUnitIds
      :hasDeletePositionPermissionUnitIds
      :position="position"
      :staffDetail="staffDetail"
      @processedPosition="handleWhenPositionProcessed"
    />
  </div>
</template>
