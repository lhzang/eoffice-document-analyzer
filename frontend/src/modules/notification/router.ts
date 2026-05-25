import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const notificationRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.notification,
    name: ROUTES_DISPLAY.notification.name,
    component: () => import('@/modules/notification/pages/NotificationList.vue'),
    meta: {
      title: ROUTES_DISPLAY.notification.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  }
]
