<script setup lang="ts">
import { Badge, Divider, Drawer, PanelMenu } from 'primevue'
import { useRoute } from 'vue-router'

import type { TEnvs } from '@/config/app-config'
import { useLayout } from '@/core/composables/layout'
import { APP_PERMISSION_VALUES, type TAppFeatureKey } from '@/shared/constants/permission'
import { ROUTE_PATHS, ROUTES_DISPLAY } from '@/shared/constants/router'
import type { DashboardDataDto } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { isExternalLink } from '@/shared/utils/check'
import { checkMatchEnv } from '@/shared/utils/common'
import { intersection } from 'lodash-es'
import type { MenuItem } from 'primevue/menuitem'
import { computed, ref, type ComputedRef } from 'vue'

type TProps = {
  statistic?: DashboardDataDto
}

const { statistic } = defineProps<TProps>()
const { isSidebarOpen, lgAndLarger } = useLayout()
const profileStore = useUserProfileStore()

const checkMenuDisplay = (excludeEnvs: TEnvs[], availablePermissions: TAppFeatureKey[]) => {
  if (excludeEnvs?.length && checkMatchEnv(excludeEnvs)) return false
  if (
    availablePermissions?.length &&
    !intersection(availablePermissions, profileStore?.user?.currentPermission)?.length
  )
    return false
  return true
}

const items: ComputedRef<MenuItem[]> = computed(() => [
  {
    label: 'Văn bản đến',
    icon: 'icon-[carbon--document-export]',
    key: 'indoc',
    availablePermissions: [],
    excludeEnvs: [],
    items: [
      {
        label: ROUTES_DISPLAY.inDocReview.label,
        icon: 'icon-[carbon--document-unknown]',
        url: ROUTE_PATHS.incomingDoc.inDocProcessing,
        badge: statistic?.incomingStatsDto?.waitingProcess,
        excludeEnvs: [],
        availablePermissions: []
      }
    ]
  }
])

const checkVisibleItems = computed(() =>
  items.value?.map((item) => ({
    ...item,
    visible: checkMenuDisplay(item?.excludeEnvs, item?.availablePermissions) && !item?.hidden,
    items: item?.items?.map((subItem) => ({
      ...subItem,
      visible:
        checkMenuDisplay(subItem?.excludeEnvs, subItem?.availablePermissions) && !subItem?.hidden
    }))
  }))
)

const route = useRoute()
const itemHasActiveChildKey = checkVisibleItems.value.find((item) =>
  item.items?.some((subItem) => subItem.url === route.path && item?.visible)
)?.key
const expandedKeys = ref(itemHasActiveChildKey ? { [itemHasActiveChildKey]: true } : {})
</script>

<template>
  <Drawer
    v-model:visible="isSidebarOpen"
    :modal="!lgAndLarger"
    :dismissable="!lgAndLarger"
    :pt="{ root: '!w-fit !rounded-tr-4xl' }"
  >
    <template #container>
      <nav class="sticky top-0 left-0 flex h-screen w-80 flex-col">
        <RouterLink to="/">
          <img src="@/assets/logo-with-name.png" class="p-3.5" />
        </RouterLink>
        <div class="mx-4">
          <Divider />
        </div>
        <PanelMenu
          class="scrollbar-hide overflow-auto"
          :model="checkVisibleItems"
          v-model:expandedKeys="expandedKeys"
          :pt="{
            panel: '!border-none !bg-inherit',
            headerLabel: 'truncate',
            root: 'mt-2'
          }"
        >
          <template #item="{ item }">
            <a
              v-if="item.url && isExternalLink(item.url)"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-surface-700 flex cursor-pointer items-center px-4 py-2"
            >
              <span class="text-xl font-semibold" :class="item.icon" />
              <span class="ml-1 font-semibold">{{ item.label }}</span>
              <div class="ml-auto">
                <Badge
                  v-if="item.badge"
                  :value="item.badge"
                  size="small"
                  severity="primary"
                  class="font-semibold"
                  unstyled
                />
              </div>
            </a>
            <RouterLink v-else-if="item.url" v-slot="{ href, navigate }" :to="item.url" custom>
              <a
                class="text-surface-700 flex cursor-pointer items-center px-4 py-2"
                :href="href"
                @click="navigate"
              >
                <span
                  class="text-xl font-semibold"
                  :class="[item.icon, { 'text-primary': route.path === item.url }]"
                />
                <span
                  class="ml-1 font-semibold"
                  :class="{ 'text-primary': route.path === item.url }"
                  >{{ item.label }}</span
                >
                <div class="ml-auto">
                  <Badge
                    v-if="item.badge"
                    :value="item.badge"
                    :size="'small'"
                    severity="primary"
                    class="font-semibold"
                    :class="{ 'text-primary': route.path === item.url }"
                    unstyled
                  />
                </div>
              </a>
            </RouterLink>
            <a v-else class="text-surface-700 flex cursor-pointer items-center px-4 py-2">
              <span class="text-xl font-semibold" :class="item.icon" />
              <span class="ml-1 font-semibold">{{ item.label }}</span>
              <span v-if="item.items" class="icon-[mingcute--down-line] ml-auto" />
            </a>
          </template>
        </PanelMenu>
      </nav>
    </template>
  </Drawer>
</template>
