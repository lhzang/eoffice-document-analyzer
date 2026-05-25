import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const systemRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.system.systemConfig,
    name: ROUTES_DISPLAY.systemConfig.name,
    component: () => import('./pages/SystemConfig.vue'),
    meta: {
      title: ROUTES_DISPLAY.systemConfig.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.systemManage]
    }
  }
]
