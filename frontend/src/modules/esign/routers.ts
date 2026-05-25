import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'
import type { RouteRecordRaw } from 'vue-router'

export const esignRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.esign.userAccount,
    name: ROUTES_DISPLAY.userAccount.name,
    component: () => import('./pages/UserAccount.vue'),
    meta: {
      title: ROUTES_DISPLAY.userAccount.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.esign.esignAccount,
    name: ROUTES_DISPLAY.esignAccount.name,
    component: () => import('./pages/EsignAccount.vue'),
    meta: {
      title: ROUTES_DISPLAY.esignAccount.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.esign.signingHistory,
    name: ROUTES_DISPLAY.signingHistory.name,
    component: () => import('./pages/SigningHistory.vue'),
    meta: {
      title: ROUTES_DISPLAY.signingHistory.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.esign.signatureImage,
    name: ROUTES_DISPLAY.signatureImage.name,
    component: () => import('./pages/SignatureImage.vue'),
    meta: {
      title: ROUTES_DISPLAY.signatureImage.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.esign.signatureImageReview,
    name: ROUTES_DISPLAY.signatureImageReview.name,
    component: () => import('./pages/SIgnatureApprove.vue'),
    meta: {
      title: ROUTES_DISPLAY.signatureImageReview.label,
      excludeEnvs: [],
      availablePermissions: [],
    }
  },
  {
    path: ROUTE_PATHS.esign.signingDevice,
    name: ROUTES_DISPLAY.signingDevice.name,
    component: () => import('./pages/SigningDevice.vue'),
    meta: {
      title: ROUTES_DISPLAY.signingDevice.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  }
]
