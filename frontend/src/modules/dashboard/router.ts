import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'
import type { RouteRecordRaw } from 'vue-router'

export const dashboardRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.dashboard,
    name: ROUTES_DISPLAY.dashboard.name,
    component: () => import('./pages/DashBoard.vue'),
    meta: {
      title: ROUTES_DISPLAY.dashboard.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  }
]
