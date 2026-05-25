import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const statisticsRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.statistics.incoming,
    name: ROUTES_DISPLAY.incomingStatistics.name,
    component: () => import('@/modules/statistics/pages/IncomingStatistics.vue'),
    meta: {
      title: ROUTES_DISPLAY.incomingStatistics.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.inDocumentStatistics]
    }
  }
]
