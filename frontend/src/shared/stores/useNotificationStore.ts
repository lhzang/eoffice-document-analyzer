import { uniqBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { NotificationDTO } from '../services/api'

export const useNotificationStore = defineStore('notificationStore', () => {
  const unReadCount = ref(0)
  const recentNotifications = ref<NotificationDTO[]>([])
  const oldNotifications = ref<NotificationDTO[]>([])
  const allNotifications = computed(() =>
    uniqBy(
      [...(recentNotifications?.value ?? []), ...(oldNotifications?.value ?? [])],
      'notificationId'
    )
  )

  function inreaseUnreadCount() {
    unReadCount.value += 1
  }

  function decreaseUnreadCount() {
    unReadCount.value -= 1
  }

  function updateUnReadCount(newNumber: number) {
    unReadCount.value = newNumber
  }

  function addRecentNotification(notification: NotificationDTO) {
    recentNotifications.value = [notification, ...recentNotifications.value]
  }

  function updateMoreOldNotifications(notifications: NotificationDTO[]) {
    oldNotifications.value = [...oldNotifications.value, ...notifications]
  }
  function resetNotificationsStore() {
    recentNotifications.value = []
    oldNotifications.value = []
    unReadCount.value = 0
  }
  function resetNotificationsListAfterEventConnect() {
    oldNotifications.value = []
  }

  function setNotifications(notification: NotificationDTO[]) {
    recentNotifications.value = []
    oldNotifications.value = notification
  }

  function markAsReadOne(notiId: string) {
    const idxInRecent = recentNotifications?.value?.findIndex(
      (noti) => noti?.notificationId === notiId
    )
    if (idxInRecent !== -1) {
      const updateNoti = recentNotifications?.value?.[idxInRecent]
      if (updateNoti)
        recentNotifications?.value?.splice(idxInRecent, 1, { ...updateNoti, read: true })
      return
    }
    const idxInOld = oldNotifications?.value?.findIndex((noti) => noti?.notificationId === notiId)
    if (idxInOld !== -1) {
      const updateNoti = oldNotifications?.value?.[idxInOld]
      if (updateNoti) oldNotifications?.value?.splice(idxInOld, 1, { ...updateNoti, read: true })
      return
    }
  }

  function markAsReadAll() {
    recentNotifications.value = recentNotifications?.value?.map((noti) => ({ ...noti, read: true }))
    oldNotifications.value = oldNotifications?.value?.map((noti) => ({ ...noti, read: true }))
  }

  return {
    unReadCount,
    allNotifications,
    recentNotifications,
    oldNotifications,
    resetNotificationsListAfterEventConnect,
    inreaseUnreadCount,
    decreaseUnreadCount,
    updateUnReadCount,
    addRecentNotification,
    updateMoreOldNotifications,
    resetNotificationsStore,
    setNotifications,
    markAsReadOne,
    markAsReadAll
  }
})
