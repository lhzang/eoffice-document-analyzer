import { NotificationApi } from '../api'
import { apiClientConfig } from '../apiClientConfig'

const notificationApi = new NotificationApi(apiClientConfig)
export const notificationService = {
  getNotifications: async (
    page: number,
    pageSize: number,
    publishedBefore: string,
    isRead?: boolean
  ) => {
    const res = await notificationApi.getNotifications(
      {
        page,
        size: pageSize,
        sort: []
      },
      isRead,
      publishedBefore
    )
    return res.data
  },
  markNotiAsRead: async (id: string) => {
    const res = await notificationApi?.markAsRead(id)
    return res?.data
  },
  markAllNotiAsRead: async () => {
    const res = await notificationApi?.markAllAsRead()
    return res?.data
  },
  getUnreadNotiNumber: async () => {
    const res = await notificationApi?.getUnreadCount()
    return res?.data
  }
}
