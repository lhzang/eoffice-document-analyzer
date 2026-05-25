import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const userRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.user.userProfile,
    name: ROUTES_DISPLAY.userProfile.name,
    component: () => import('@/modules/user/pages/UserProfile.vue'),
    meta: { title: ROUTES_DISPLAY.userProfile.label, excludeEnvs: [], availablePermissions: [] }
  }
]
