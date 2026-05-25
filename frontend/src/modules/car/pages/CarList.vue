<script setup lang="ts">
import { router } from '@/router'
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { Button } from 'primevue'
import { computed } from 'vue'
import ListCollaboratorCar from '../components/ListCollaboratorCar.vue'
import ListGuestCar from '../components/ListGuestCar.vue'
import ListStaffCar from '../components/ListStaffCar.vue'
import ListStudentCar from '../components/ListStudentCar.vue'
import ListUniCar from '../components/ListUniCar.vue'
import { useExportStaffCars } from '../composables/queries/carActions/useExportStaffCars'
import { useCarListFilter } from '../composables/useCarListFilter'
import { CAR_LIST, CAR_TYPES } from '../constants/carType'
import type { TCarType } from '../models/common'

const { user } = useUserProfileStore()
const userPermission = user?.currentPermission ?? []

const tabList = computed(() => {
  const hasPermCarTypeList: TCarType[] = []
  userPermission?.forEach((perm) => {
    if (perm === APP_PERMISSION_VALUES.viewStaffCar) hasPermCarTypeList.push(CAR_TYPES.staff)
    if (perm === APP_PERMISSION_VALUES.viewUniCar) hasPermCarTypeList.push(CAR_TYPES.university)
    if (perm === APP_PERMISSION_VALUES.viewStudentCar) hasPermCarTypeList.push(CAR_TYPES.student)
    if (perm === APP_PERMISSION_VALUES.viewGuestCar) hasPermCarTypeList.push(CAR_TYPES.guest)
    if (perm === APP_PERMISSION_VALUES.viewCollaboratorCar)
      hasPermCarTypeList.push(CAR_TYPES.collaborator)
  })
  return CAR_LIST?.filter((carType) => hasPermCarTypeList?.includes(carType?.value))
})
const { search, selectTab, handleSearch, handleResetFilter } = useCarListFilter(tabList.value)
const { mutate: exportStaffCars, isPending: isExportingCar } = useExportStaffCars({
  onSuccess: (data) => {
    const fileURL = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = fileURL
    link.setAttribute('download', 'Danh sách xe cán bộ.xls')
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(fileURL)
  }
})

const handleExport = () => {
  exportStaffCars()
}

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
      <AppTabs
        v-model="selectTab"
        scrollable
        @update:model-value="handleChangeTab"
        :tab-list="tabList"
      />
      <AppFilterBarWithSearch
        class="flex items-center justify-end gap-2 self-end lg:self-center"
        placeholder="Tìm kiếm"
        :search-string="search"
        @search="(search) => handleSearch(search ?? '')"
      >
        <template v-if="selectTab === CAR_TYPES.staff" #preAdditionalSlot>
          <Button
            class="whitespace-nowrap"
            label="Xuất excel"
            variant="contained"
            :loading="isExportingCar"
            @click="handleExport"
          />
        </template>
      </AppFilterBarWithSearch>
    </div>
    <div class="mt-4 lg:mt-8">
      <ListStaffCar
        v-if="selectTab === CAR_TYPES.staff"
        :active-tab="selectTab"
        :search-value="search"
      />
      <ListGuestCar
        v-if="selectTab === CAR_TYPES.guest"
        :active-tab="selectTab"
        :search-value="search"
      />
      <ListUniCar
        v-if="selectTab === CAR_TYPES.university"
        :active-tab="selectTab"
        :search-value="search"
      />
      <ListCollaboratorCar
        v-if="selectTab === CAR_TYPES.collaborator"
        :active-tab="selectTab"
        :search-value="search"
      />
      <ListStudentCar
        v-if="selectTab === CAR_TYPES.student"
        :active-tab="selectTab"
        :search-value="search"
      />
    </div>
  </div>
</template>
