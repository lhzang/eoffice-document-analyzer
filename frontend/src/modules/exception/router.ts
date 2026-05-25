import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTE_PATHS, ROUTES_DISPLAY } from '@/shared/constants/router'
import type { RouteRecordRaw } from 'vue-router'

export const exceptionRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.exception.editIssuedDoc,
    name: ROUTES_DISPLAY.exception.editIssuedDoc,
    component: () => import('@/modules/exception/pages/EditIssuedDocument.vue'),
    meta: {
      title: ROUTES_DISPLAY.exception.editIssuedDoc,
      excludeEnvs: [],
      availablePermissions: [
        APP_PERMISSION_VALUES.cancelOutDoc,
        APP_PERMISSION_VALUES.updateAnexesOutDoc,
        APP_PERMISSION_VALUES.updateIssueDateOutDoc,
        APP_PERMISSION_VALUES.replaceMainFileOutDoc
      ]
    }
  },
  {
    path: ROUTE_PATHS.exception.exceptionHistory,
    name: ROUTES_DISPLAY.exceptionHistory.exceptionHistory,
    component: () => import('@/modules/exception/pages/IssuedDocEditHistory.vue'),
    meta: {
      title: ROUTES_DISPLAY.exceptionHistory.exceptionHistory,
      excludeEnvs: [],
      availablePermissions: [
        APP_PERMISSION_VALUES.cancelOutDoc,
        APP_PERMISSION_VALUES.updateAnexesOutDoc,
        APP_PERMISSION_VALUES.updateIssueDateOutDoc,
        APP_PERMISSION_VALUES.replaceMainFileOutDoc
      ]
    }
  }
]
