<script setup lang="ts">
import { router } from '@/router'
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { computed } from 'vue'
import ListCreatedGuestCar from '../components/ListCreatedGuestCar.vue'
import ListCreatedStaffCar from '../components/ListCreatedStaffCar.vue'
import { useRequestCarListFilter } from '../composables/useRequestCarListFilter'
import { CAR_LIST, CAR_TYPES } from '../constants/carType'

const { user } = useUserProfileStore()
const userPermission = user?.currentPermission ?? []

const tabList = computed(() => {
  // const hasPermCarTypeList: TCarType[] = []
  // userPermission?.forEach((perm) => {
  //   if (perm === APP_PERMISSION_VALUES.evaluateStaffCar) hasPermCarTypeList.push(CAR_TYPES.staff)
  //   if (perm === APP_PERMISSION_VALUES.evaluateGuestCar) hasPermCarTypeList.push(CAR_TYPES.guest)
  // })
  return CAR_LIST?.filter(
    (carType) => carType.value === CAR_TYPES?.staff || carType.value === CAR_TYPES?.guest
  )
})
const { filterParams, handleFilterStatus, selectTab, handleSearch, handleResetFilter } =
  useRequestCarListFilter(tabList.value)

const handleChangeTab = () => {
  handleResetFilter()
  router.push({
    query: {
      tab: selectTab.value
    }
  })
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-4">
      <AppTabs v-model="selectTab" @update:model-value="handleChangeTab" :tab-list="tabList" />
      <AppFilterBarWithSearch
        class="flex items-center justify-end gap-2 self-end lg:self-center"
        placeholder="Tìm kiếm"
        :search-string="filterParams?.search"
        @search="(search) => handleSearch(search ?? '')"
      >
      </AppFilterBarWithSearch>
    </div>
    <div class="mt-4 lg:mt-8">
      <ListCreatedStaffCar
        v-if="selectTab === CAR_TYPES.staff"
        :active-tab="selectTab"
        :filterValues="filterParams"
        @submit-filter="(filter) => handleFilterStatus(filter)"
      />
      <ListCreatedGuestCar
        v-if="selectTab === CAR_TYPES.guest"
        :active-tab="selectTab"
        :filterValues="filterParams"
        @submit-filter="(filter) => handleFilterStatus(filter)"
      />
    </div>
  </div>
</template>
