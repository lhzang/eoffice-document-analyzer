<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { useQueryClient } from '@tanstack/vue-query'
import { Button } from 'primevue'
import { ref } from 'vue'
import AccountManageTable from '../components/AccountManageTable.vue'
import ModalAddNewStaff from '../components/ModalAddNewStaff.vue'

type TModalAddStaffRef = InstanceType<typeof ModalAddNewStaff>

const profileStore = useUserProfileStore()
const searchValue = ref<string>('')

const modalAddStaffRef = ref<TModalAddStaffRef | null>(null)

const queryClient = useQueryClient()

const refetchListAccount = () => {
  queryClient?.invalidateQueries({ queryKey: ['getListAccount'] })
}

const handleSearch = (val: string) => {
  searchValue.value = val
}

const handleOpenAddModal = () => {
  modalAddStaffRef?.value?.openModal()
}
</script>
<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <AppFilterBarWithSearch
        class="flex items-center justify-end gap-2"
        placeholder="Tìm kiếm nhân sự"
        :search-string="searchValue"
        @search="handleSearch"
      >
        <template
          #postAdditionalSlot
          v-if="
            checkIfUserHasPermission(
              profileStore?.user?.currentPermission ?? [],
              APP_PERMISSION_VALUES.createPosition
            )
          "
        >
          <Button label="Thêm mới" variant="contained" @click="handleOpenAddModal" />
        </template>
      </AppFilterBarWithSearch>
    </div>
    <AccountManageTable :search-value="searchValue" @staff-deleted="refetchListAccount" />
    <ModalAddNewStaff
      v-if="
        checkIfUserHasPermission(
          profileStore?.user?.currentPermission ?? [],
          APP_PERMISSION_VALUES.createPosition
        )
      "
      ref="modalAddStaffRef"
      @create-staff="refetchListAccount"
    />
  </div>
</template>
