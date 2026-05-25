<script setup lang="ts">
import type { TSigner } from '@/shared/models/outDoc/signer'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { Checkbox } from 'primevue'

type TProps = {
  permittedStaffList: TSigner[]
}

const emits = defineEmits<{
  'staff-select': [TSigner]
  'staff-unselect': [TSigner]
}>()

const { permittedStaffList } = defineProps<TProps>()

const user = useUserProfileStore().user

const selectedStaffs = defineModel<TSigner[]>({
  required: true
})

const handleToggleChange = (event: Event, staff: TSigner) => {
  const target = event?.target as HTMLInputElement
  if (target.checked) emits('staff-select', staff)
  else emits('staff-unselect', staff)
}
</script>
<template>
  <div>
    <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
      <div class="item flex-1">Người ký</div>
      <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
    </div>
    <div class="relative">
      <div class="relative h-[400px] min-h-[200px] overflow-auto">
        <div
          v-for="(staff, idx) in permittedStaffList"
          :key="idx"
          :class="`border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold`"
        >
          <div class="flex flex-1 items-center truncate">
            <span>{{ staff?.displayName }}</span>
          </div>
          <div class="flex h-auto w-10 shrink-0 items-center justify-center">
            <Checkbox
              name="staff"
              v-model="selectedStaffs"
              @change="(event) => handleToggleChange(event, staff)"
              :value="staff"
              @click.stop
            ></Checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
