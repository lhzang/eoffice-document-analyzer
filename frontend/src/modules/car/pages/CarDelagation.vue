<script setup lang="ts">
import { router } from '@/router'
import AppTabs from '@/shared/components/AppTabs.vue'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import GlobalApproveAndRegisterCarPermissionConfig from '../components/GlobalApproveAndRegisterCarPermissionConfig.vue'
import GlobalDeleteCarPermissionConfig from '../components/GlobalDeleteCarPermissionConfig.vue'
import GlobalViewCarPermissionConfig from '../components/GlobalViewCarPermissionConfig.vue'
import { CAR_TAB_LIST, CAR_TAB_VALUES } from '../constants/carDelagation'
import type { TCarAdminAction } from '../models/carDelagation'

const route = useRoute()

const user = useUserProfileStore().user

const tabList = computed(() => CAR_TAB_LIST)

//this role for view + approve/register
const isHasManageCarPermission = computed(() =>
  checkIfUserHasPermission(user?.currentPermission ?? [], APP_PERMISSION_VALUES.manageCar)
)
// const isHasDeleteStaffCarPermission = computed(() =>
//   checkIfUserHasPermission(
//     (user?.currentPermission as TAppFeatureKey[]) ?? [],
//     'car.staff_car.delete'
//   )
// )
// const isHasDeleteGuestCarPermission = computed(() =>
//   checkIfUserHasPermission(
//     (user?.currentPermission as TAppFeatureKey[]) ?? [],
//     'car.guest_car.delete'
//   )
// )
// const isHasDeleteUniCarPermission = computed(() =>
//   checkIfUserHasPermission(
//     (user?.currentPermission as TAppFeatureKey[]) ?? [],
//     'car.university_car.delete'
//   )
// )
// const isHasDeleteCollaboratorCarPermission = computed(() =>
//   checkIfUserHasPermission(
//     (user?.currentPermission as TAppFeatureKey[]) ?? [],
//     'car.collaborator_car.delete'
//   )
// )

const selectTab = ref(
  tabList.value?.find((tab) => tab.value === (route.query?.tab?.toString() as TCarAdminAction))
    ?.value || tabList.value[0].value
)

const handleChangeTab = () => {
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
    </div>
    <div class="mt-8">
      <GlobalViewCarPermissionConfig
        v-if="isHasManageCarPermission && selectTab === CAR_TAB_VALUES.view"
      />
      <GlobalApproveAndRegisterCarPermissionConfig
        v-if="isHasManageCarPermission && selectTab === CAR_TAB_VALUES.approveAndRegister"
      />
      <GlobalDeleteCarPermissionConfig
        v-if="isHasManageCarPermission && selectTab === CAR_TAB_VALUES.delete"
      />
    </div>
  </div>
</template>
