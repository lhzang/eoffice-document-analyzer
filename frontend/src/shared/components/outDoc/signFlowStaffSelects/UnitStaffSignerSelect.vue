<script setup lang="ts">
import { useGetAllUsersInUnit } from '@/shared/composables/queries/organization/unit/useGetAllUsersInUnit'
import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import type { QueryOptions } from '@/shared/models/common'
import type { TSigner } from '@/shared/models/outDoc/signer'
import type { StaffVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { extractSignerValueFromStaffData } from '@/shared/utils/outDoc/signer'
import { Checkbox } from 'primevue'

type TProps = {
  type: 'LEADER' | 'ALL'
}

const emits = defineEmits<{
  'staff-select': [TSigner]
  'staff-unselect': [TSigner]
}>()

const { type } = defineProps<TProps>()

const user = useUserProfileStore().user

const selectedStaffs = defineModel<TSigner[]>({
  required: true
})

const { data: listUsersInUnit, isLoading: isGettingUserList } = useGetAllUsersInUnit(
  () => user?.currentPosition?.unitId!,
  {
    enabled: () => !!user?.currentPosition?.unitId,
    select: (staffs): TSigner[] => {
      if (type === 'LEADER')
        return staffs
          ?.filter(
            (staff) =>
              staff?.positions?.[0]?.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
              staff?.positions?.[0]?.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead ||
              staff?.positions?.[0]?.roleInUnit === ROLE_IN_UNIT_VALUES.unitDeputy
          )
          ?.map((staff) => extractSignerValueFromStaffData(staff))
      else return staffs?.map((staff) => extractSignerValueFromStaffData(staff))
    },
    structuralSharing: false
  } as QueryOptions<Array<StaffVM>, TServerError, TSigner[]>
)

const handleToggleChange = (event: Event, staff: TSigner) => {
  const target = event?.target as HTMLInputElement
  if (target.checked) emits('staff-select', staff)
  else emits('staff-unselect', staff)
}
</script>
<template>
  <div>
    <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
      <div class="item flex-1">{{ user?.currentPosition?.unitName }}</div>
      <div class="flex w-10 shrink-0 items-center justify-center">Chọn</div>
    </div>
    <div class="relative">
      <div
        v-if="isGettingUserList"
        class="absolute top-0 left-0 flex h-full w-full items-center justify-center"
      >
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <div
        v-if="!listUsersInUnit?.length"
        class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
      >
        <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
        <span class="text-lg font-medium text-gray-400">Không có nhân sự</span>
      </div>
      <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
        <div
          v-for="(staff, idx) in listUsersInUnit"
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
