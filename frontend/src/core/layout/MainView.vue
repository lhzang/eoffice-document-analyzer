<script setup lang="ts">
import { useLayout } from '@/core/composables/layout'
import { useGetStatistic } from '@/modules/dashboard/composables/queries/useGetStatistic'
import ModalSelectUsb from '@/shared/components/modals/ModalSelectUsb.vue'
import type { TUsbSignsNoti } from '@/shared/models/usb.types'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useNotificationStore } from '@/shared/stores/useNotificationStore'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import {
  getNotificationSummary,
  getObjectLabel
} from '@/shared/utils/notification/convertDisplayLabel'
import { updateProfile } from '@/shared/utils/profile'
import { useToast } from 'primevue'
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from './SideBar.vue'
import TopBar from './TopBar.vue'
const { data: statistic, refetch } = useGetStatistic()

type TModalRef = InstanceType<typeof ModalSelectUsb>

let evtSource: EventSource | null = null

const modalSelectUsb = useTemplateRef<TModalRef>('modalSelectUsb')
const router = useRouter()

const { isSidebarOpen } = useLayout()

const loading = ref(false)

const userStore = useUserProfileStore()
const notificationStore = useNotificationStore()

const toast = useToast()

const currentPositionId = computed(() => {
  return userStore.user?.currentPosition?.id
})
// handle fallback for route loading
router.beforeEach(async (to, _, next) => {
  const matched = to.matched.find((record) => {
    const comp = record.components?.default
    return typeof comp === 'function'
  })

  if (matched) {
    loading.value = true
    try {
      // Await the actual dynamic import
      const compLoader = matched.components!.default as () => Promise<unknown>
      await compLoader()
    } catch (e) {
      console.error('Failed to load component:', e)
    }
  }

  next()
})

router.afterEach(() => {
  loading.value = false
})

const getInitialRoute = () => {}

const initApp = async () => {
  const profileStore = useUserProfileStore()
  const checkIsLogin = !!profileStore?.user
  await updateProfile()
  if (!checkIsLogin) {
    getInitialRoute()
  }
  // const sseEvent = await initEventSource()
}

// onMounted(() => {
await initApp()
// })
watch(
  () => userStore?.user?.currentPosition?.id,
  (currentPosId) => {
    notificationStore.resetNotificationsStore()
    evtSource?.close()
    evtSource = null
    if (currentPosId) {
      evtSource = new EventSource(
        apiClientConfig.basePath + '/api/sse' + `?access_token=${userStore.accessToken}`
      )
      evtSource.addEventListener('notification', (e) => {
        const notification = JSON?.parse(e?.data)
        if (notification?.id) {
          notificationStore?.addRecentNotification(notification)
          notificationStore?.inreaseUnreadCount()
        }
        if (notification?.object?.type === 'usb_sign_request') {
          modalSelectUsb?.value?.openModal(notification?.object as TUsbSignsNoti)
        }
        toast.add({
          severity: 'info',
          summary: getObjectLabel(notification?.object?.type),
          detail: getNotificationSummary(notification),
          life: 5000
        })
      })
      refetch()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  evtSource?.close()
})
</script>

<template>
  <Suspense>
    <div class="scrollbar scrollbar-thumb-sky-700 h-dvh">
      <SideBar :key="userStore.user?.currentPosition?.id" :statistic="statistic?.data" />
      <div
        class="flex h-dvh flex-col transition-all duration-300 ease-in-out"
        :class="{ 'lg:pl-80': isSidebarOpen }"
      >
        <header
          class="border-b-surface-200 top-0 z-500 flex h-28 flex-col justify-between border-b-1 bg-white px-7 py-1.5 lg:h-16 lg:flex-row"
        >
          <TopBar />
        </header>
        <main
          class="flex h-[calc(100%_-_(calc(var(--spacing)_*_16)))] w-full flex-1 flex-col overflow-auto px-7"
        >
          <div
            v-if="loading"
            class="flex h-[calc(100vh_-_48px)] w-full items-center justify-center"
          >
            <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
          </div>
          <RouterView class="py-7" :key="currentPositionId" v-else />
          <ModalSelectUsb ref="modalSelectUsb" />
        </main>
      </div>
    </div>

    <template #fallback>
      <div class="flex h-screen w-screen items-center justify-center bg-red-500">
        <span
          class="icon-[line-md--loading-twotone-loop] text-primary animate-spin text-2xl"
        ></span>
      </div>
    </template>
  </Suspense>
</template>
