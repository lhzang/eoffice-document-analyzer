import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'
import type { RouteRecordRaw } from 'vue-router'

export const internalDocRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.internalDoc.process,
    name: ROUTES_DISPLAY.internalDocProcess.name,
    component: () => import('./pages/WaitForProcessInternalDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.internalDocProcess.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.internalDoc.create,
    name: ROUTES_DISPLAY.internalDocCreate.name,
    component: () => import('./pages/RegisterEInternalDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.internalDocCreate.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.internalDoc.created,
    name: ROUTES_DISPLAY.internalDocCreated.name,
    component: () => import('./pages/CreatedInternalDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.internalDocCreated.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.internalDoc.reject,
    name: ROUTES_DISPLAY.internalDocRejected.name,
    component: () => import('./pages/RejectedInternalDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.internalDocRejected.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.internalDoc.search,
    name: ROUTES_DISPLAY.searchInternalDoc.name,
    component: () => import('./pages/DocumentSearch.vue'),
    meta: {
      title: ROUTES_DISPLAY.searchInternalDoc.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },

  {
    path: ROUTE_PATHS.internalDoc.reRegisterDoc,
    name: ROUTES_DISPLAY.internalDocReRegister.name,
    component: () => import('./pages/ReRegisterEInternalDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.internalDocReRegister.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  }
]
