import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const clericalRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.clerical.documentBook,
    name: ROUTES_DISPLAY.clericaDocumentBook.name,
    component: () => import('./pages/DocumentBook.vue'),
    meta: {
      title: ROUTES_DISPLAY.clericaDocumentBook.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.viewDocumentBook]
    }
  },
  {
    path: ROUTE_PATHS.clerical.adminDocumentType,
    name: ROUTES_DISPLAY.clericaDocumentType.name,
    component: () => import('./pages/AdminDocumentType.vue'),
    meta: {
      title: ROUTES_DISPLAY.clericaDocumentType.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.manageDocumentType]
    }
  },
  {
    path: ROUTE_PATHS.clerical.externalOrganization,
    name: ROUTES_DISPLAY.externalOrganization.name,
    component: () => import('./pages/ExternalOrganization.vue'),
    meta: {
      title: ROUTES_DISPLAY.externalOrganization.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.listExternalUnit]
    }
  },
  {
    path: ROUTE_PATHS.clerical.printDocumentBook,
    name: ROUTES_DISPLAY.printDocumentBook.name,
    component: () => import('./pages/PrintDocumentBook.vue'),
    meta: {
      title: ROUTES_DISPLAY.printDocumentBook.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.manageDocumentBook]
    }
  }
]
