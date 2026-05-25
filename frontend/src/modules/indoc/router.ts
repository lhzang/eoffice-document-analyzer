import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const inDocumentRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.incomingDoc.inDocProcessing,
    name: ROUTES_DISPLAY.inDocReview.name,
    component: () => import('@/modules/indoc/pages/DocumentReview.vue'),
    meta: { title: ROUTES_DISPLAY.inDocReview.label, excludeEnvs: [], availablePermissions: [] }
  }
]
