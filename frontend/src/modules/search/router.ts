import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const searchRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.search,
    name: ROUTES_DISPLAY.search.name,
    component: () => import('./pages/DocumentSearch.vue'),
    meta: {
      title: ROUTES_DISPLAY.search.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.searchDocument]
    }
  }
]
