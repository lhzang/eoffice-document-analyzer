import { useQueryClient } from '@tanstack/vue-query'
import { DateTime } from 'luxon'
import { computed, ref, watch, watchEffect, type Ref } from 'vue'
import type { TAppTab } from '../models/common'
import { useNotificationStore } from '../stores/useNotificationStore'
import { useUserProfileStore } from '../stores/userProfileStore'
import { useGetInfinityNotifications } from './queries/notification/useGetInfinityNotifications'
import { useGetUnReadNotification } from './queries/notification/useGetUnReadNotification'
import { useMarkAllNotiAsRead } from './queries/notification/useMarkAllNotiAsRead'
import { useMarkNotiAsRead } from './queries/notification/useMarkNotiAsRead'
type TNotiTabsValue = 'all' | 'unRead'

export const useNotification = (enableinitFetch?: Ref<boolean>) => {
  const userStore = useUserProfileStore()
  const notificationStore = useNotificationStore()
  const queryClient = useQueryClient()
  const tabList: TAppTab<TNotiTabsValue>[] = [
    {
      label: 'Tất cả',
      value: 'all'
    },
    {
      label: 'Chưa đọc',
      value: 'unRead'
    }
  ]
  const selectedTab = ref<TNotiTabsValue>('all')
  const fetchTime = ref(DateTime.fromJSDate(new Date()).toISO({ includeOffset: false }))

  const {
    data: notifications,
    // error: notiErrors,
    isFetchingNextPage: isGetNextExternalLoading,
    fetchNextPage,
    hasNextPage
  } = useGetInfinityNotifications(
    computed(() => ({
      pageSize: 10,
      isRead: selectedTab?.value === 'unRead' ? false : undefined,
      publishedBefore: fetchTime?.value!
    })),
    { enabled: () => enableinitFetch?.value ?? true }
  )

  const resetNotificationListWhenChangeTab = () => {
    notificationStore.resetNotificationsListAfterEventConnect()
    queryClient.removeQueries({ queryKey: ['getExternalUnits'] })
  }

  const {
    refetch: reFetchGetUnreadNotiNum,
    data: unReadNotiNum,
    isSuccess: isGetUnReadCountSuccess
  } = useGetUnReadNotification()

  const { mutate: readNoti } = useMarkNotiAsRead()
  const { mutate: readAllNoti, isPending: isReadingAllNoti } = useMarkAllNotiAsRead({
    onSuccess: () => {
      notificationStore?.markAsReadAll()
    }
  })

  const readNotiWithCallback = (id: string) => {
    readNoti(id, {
      onSuccess: () => {
        notificationStore?.markAsReadOne(id)
        notificationStore?.decreaseUnreadCount()
      }
    })
  }
  watch(
    () => notifications.value?.pages.length,
    () => {
      const pages = notifications?.value?.pages
      if (!pages?.length) return
      const lastPage = pages[pages.length - 1]
      if (!lastPage) return
      notificationStore.updateMoreOldNotifications(lastPage?.items)
    }
  )

  watch(
    () => userStore?.user?.currentPosition?.id,
    () => {
      selectedTab.value = 'all'
      reFetchGetUnreadNotiNum()
      fetchTime.value = DateTime.fromJSDate(new Date()).toISO({ includeOffset: false })
    }
  )

  watchEffect(() => {
    if (isGetUnReadCountSuccess) {
      notificationStore?.updateUnReadCount(unReadNotiNum?.value ?? 0)
    }
  })

  return {
    tabList,
    selectedTab,
    isGetNextExternalLoading,
    hasNextPage,
    isReadingAllNoti,
    readAllNoti,
    resetNotificationListWhenChangeTab,
    readNoti: readNotiWithCallback,
    fetchNextPage
  }
}
