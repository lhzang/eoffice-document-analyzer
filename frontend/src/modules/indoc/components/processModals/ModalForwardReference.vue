<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetAllUsersInUnit } from '@/shared/composables/queries/organization/unit/useGetAllUsersInUnit'
import type { StaffVM } from '@/shared/services/api'
import { Checkbox } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'

type TProps = {
  unitId: string
  distributedUserPositionIds: string[]
}
type Modal = InstanceType<typeof AppModal>

const { unitId, distributedUserPositionIds } = defineProps<TProps>()
const modalRef = useTemplateRef<Modal>('modalRef')

const selectedUsers = ref<StaffVM[]>([])
const { data: listUsersInUnit, isLoading: isGettingUserList } = useGetAllUsersInUnit(unitId)

const checkIfUserDisabled = (user: StaffVM) => {
  return distributedUserPositionIds?.includes(user.id)
}

const availableUsers = computed(() =>
  listUsersInUnit?.value?.filter((user) => !checkIfUserDisabled(user))
)

const handleToggleSelectAllUsersInUnit = () => {
  if (!availableUsers.value?.length) return
  if (selectedUsers?.value?.length === availableUsers.value?.length) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = availableUsers.value
  }
}

defineExpose({
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})
</script>
<template>
  <AppModal title="Chuyển tiếp văn bản" ref="modalRef" :wrapper-style="{ width: '60%' }">
    <div class="mb-6 h-[600px]">
      <div class="bg-primary top-0 flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
        <div class="flex-1">Chọn</div>
        <div class="flex w-10 shrink-0 items-center justify-center">
          <Checkbox
            name="receiver"
            binary
            :model-value="
              !!availableUsers?.length && availableUsers.length === selectedUsers.length
            "
            :disabled="!availableUsers?.length"
            @change="handleToggleSelectAllUsersInUnit"
          ></Checkbox>
        </div>
      </div>
      <div v-if="isGettingUserList" class="absolute flex h-full w-full items-center justify-center">
        <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
      </div>
      <template v-else>
        <div v-if="!listUsersInUnit?.length" class="flex h-full w-full items-center justify-center">
          <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
          <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
        </div>
        <div
          v-else
          v-for="(user, index) of listUsersInUnit"
          :key="index"
          class="text-primary mb-1 flex h-10 cursor-pointer items-center gap-1 bg-white px-4 py-2 font-bold"
        >
          <div class="flex flex-1 items-center truncate">{{ user.fullName }}</div>
          <div class="flex w-10 shrink-0 items-center justify-center">
            <Checkbox
              :disabled="checkIfUserDisabled(user)"
              name="receiver"
              :value="user"
              v-model="selectedUsers"
            ></Checkbox>
          </div>
        </div>
      </template>
    </div>
  </AppModal>
</template>
