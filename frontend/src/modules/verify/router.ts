import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const verifyRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.verify,
    name: ROUTES_DISPLAY.verify.label,
    component: () => import('@/modules/verify/pages/DocumentUploadVerify.vue'),
    meta: {
      title: ROUTES_DISPLAY.verify.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.verifyDocument,
    name: ROUTES_DISPLAY.verifyDocument.label,
    component: () => import('@/modules/verify/pages/DocumentVerify.vue'),
    meta: {
      title: ROUTES_DISPLAY.verifyDocument.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  }
]
