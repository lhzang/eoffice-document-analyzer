<script setup lang="ts">
import type {
  TStaffSelectValue
} from '@/shared/models/organization/unit'

const selectedStaffs = defineModel<TStaffSelectValue[] | null>({
  required: true
})

// Remove staff from selection
const removeStaff = (staffToRemove: TStaffSelectValue) => {
  if (!selectedStaffs.value) return
  
  const filtered = selectedStaffs.value.filter(
    (value) => value.positionId !== staffToRemove.positionId
  )
  
  selectedStaffs.value = filtered.length > 0 ? filtered : null
}
</script>

<template>
  <div class="card flex-1">
    <div
      class="bg-primary mt-4 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white mb-3"
    >
      <div class="item flex-1">Những người đã chọn ({{ selectedStaffs?.length }})</div>
    </div>

    <div v-if="selectedStaffs?.length === 0" class="flex h-full min-h-[200px] items-center justify-center">
      <span class="text-lg font-medium text-gray-400">Chưa chọn người nào</span>
    </div>

    <div v-else class="max-h-[400px] overflow-auto">
      <div
        v-for="staff in selectedStaffs"
        :key="staff.positionId"
        class="flex gap-4 items-center border-b border-surface-300 py-2"
      >
        <div
          @click="removeStaff(staff)"
          class="flex h-full w-6 shrink-0 cursor-pointer items-center justify-center bg-white font-semibold text-gray-400 transition hover:text-red-400"
        >
          <span class="icon-[tabler--trash] text-2xl"></span>
        </div>
        <div class="flex items-end text-[#334155] font-semibold">{{ staff.displayName }}</div>
      </div>
    </div>
  </div>
</template>
