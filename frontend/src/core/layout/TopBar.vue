<script setup lang="ts">
import { useLayout } from '@/core/composables/layout'
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import FunctionalHeaderNotification from '@/shared/components/notification/FunctionalHeaderNotification.vue'
import PlaceholderHeaderNotification from '@/shared/components/notification/PlaceholderHeaderNotification.vue'
import { useAuth } from '@/shared/composables/useAuth'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { createAvatarData } from '@/shared/utils/common'
import { checkIfUserHasPermission } from '@/shared/utils/permission'
import { Avatar, Button, Divider, Popover } from 'primevue'
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Tippy } from 'vue-tippy'

type PopoverInstance = ComponentPublicInstance & InstanceType<typeof Popover>

const { toggleSidebar } = useLayout()
const route = useRoute()
const title = computed(() => route.meta.title)

const profileStore = useUserProfileStore()
const { changeUserPosition, logout } = useAuth()

const userPopoverRef = ref<PopoverInstance>()
const placeholderAvatar = computed(() => createAvatarData(profileStore?.user?.fullName ?? ''))

const toggleUserPopover = (event: MouseEvent) => {
  userPopoverRef.value?.toggle(event)
}

const userPosionOpts = computed(() =>
  (profileStore?.user?.positions ?? [])?.map((pos) => ({
    label: pos?.title,
    value: pos?.id
  }))
)
const header = ref<HTMLElement | null>(null)
const fetchUserPositionOpts = () => ({
  options: userPosionOpts.value,
  hasMore: false
})

const handleChangePosition = (newOpt: TCommonSelectOptions<string>) => {
  changeUserPosition(newOpt?.value)
  userPopoverRef?.value?.hide()
}
</script>

<template>
  <div class="flex flex-row justify-between" ref="header">
    <Button
      icon="pi pi-bars"
      variant="text"
      severity="contrast"
      size="small"
      @click="toggleSidebar"
    />
    <div class="hidden lg:inline">
      <Divider layout="vertical" />
    </div>
    <span class="text-surface-700 flex items-center p-0 text-lg font-semibold lg:text-base">{{
      title
    }}</span>

    <div class="lg:hidden">
      <RouterLink to="/">
        <img src="@/assets/logo.png" class="h-12" />
      </RouterLink>
    </div>
  </div>
  <div class="flex flex-row items-center justify-between gap-3.5">
    <PlaceholderHeaderNotification
      class="cursor-not-allowed"
      v-if="route?.path === ROUTE_PATHS?.notification"
    />
    <FunctionalHeaderNotification class="h-full" v-else />

    <div class="flex cursor-pointer items-center gap-4" @click="toggleUserPopover">
      <Tippy :content="profileStore?.user?.fullName">
        <Avatar
          :label="placeholderAvatar.label"
          :style="{ backgroundColor: placeholderAvatar.color, color: 'white' }"
        />
      </Tippy>
      <div>
        <div>{{ profileStore?.user?.fullName }}</div>
        <div class="text-primary font-semibold">
          Vị trí: {{ profileStore?.user?.currentPosition?.title }}
          <template v-if="profileStore?.user?.currentPosition?.unitShortName">
            - {{ profileStore?.user?.currentPosition?.unitShortName }}
          </template>
        </div>
      </div>
      <Popover ref="userPopoverRef" id="userPop">
        <div class="flex w-2xs flex-col gap-2 rounded">
          <span class="text-primary text-lg font-bold">Tài khoản</span>
          <div class="flex items-center gap-2">
            <Tippy :content="profileStore?.user?.fullName">
              <Avatar
                :label="placeholderAvatar.label"
                shape="circle"
                :style="{ backgroundColor: placeholderAvatar.color, color: 'white' }"
              />
            </Tippy>
            <div>
              <div>{{ profileStore?.user?.fullName }}</div>
            </div>
          </div>
          <div>
            <div class="mb-2 font-bold">Đăng nhập với vị trí</div>
            <AppSelect
              name="position"
              :fetch-options="fetchUserPositionOpts"
              isFetchOnInit
              :defaultValue="
                userPosionOpts?.find(
                  (posOpt) => posOpt?.value === profileStore?.user?.currentPosition?.id
                )
              "
              @select="handleChangePosition"
            />
          </div>
          <Divider class="mt-4! mb-2! p-0" />
          <div>
            <RouterLink :to="ROUTE_PATHS.user.userProfile">
              <div
                class="flex cursor-pointer items-center gap-2 rounded-sm p-2 font-semibold transition hover:bg-gray-100"
              >
                <span class="icon-[streamline--user-profile-focus] text-lg"></span>
                <span>Thông tin cá nhân</span>
              </div>
            </RouterLink>
            <RouterLink
              v-if="
                checkIfUserHasPermission(
                  profileStore?.user?.currentPermission ?? [],
                  APP_PERMISSION_VALUES.systemManage
                )
              "
              :to="ROUTE_PATHS.system.systemConfig"
            >
              <div
                class="flex cursor-pointer items-center gap-2 rounded-sm p-2 font-semibold transition hover:bg-gray-100"
              >
                <span class="icon-[mdi--building] text-lg"></span>
                <span>Thông tin đơn vị</span>
              </div>
            </RouterLink>
            <div
              class="flex cursor-pointer items-center gap-2 rounded-sm p-2 font-semibold transition hover:bg-gray-100"
              @click="logout"
            >
              <span class="icon-[material-symbols--logout] text-lg"></span>
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  </div>
</template>
