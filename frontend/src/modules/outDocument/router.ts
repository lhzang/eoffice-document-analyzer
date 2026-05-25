import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'
import type { RouteRecordRaw } from 'vue-router'

export const outDocRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.outDoc.process,
    name: ROUTES_DISPLAY.outDocProcess.name,
    component: () => import('@/modules/outDocument/pages/WaitForProcessOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocProcess.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.outDoc.create,
    name: ROUTES_DISPLAY.outDocCreate.name,
    component: () => import('@/modules/outDocument/pages/RegisterEOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocCreate.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.createPaper,
    name: ROUTES_DISPLAY.outDocCreatePaper.name,
    component: () => import('@/modules/outDocument/pages/RegisterPaperOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocCreatePaper.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.created,
    name: ROUTES_DISPLAY.outDocCreated.name,
    component: () => import('@/modules/outDocument/pages/CreatedOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocCreated.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.reject,
    name: ROUTES_DISPLAY.outDocRejected.name,
    component: () => import('@/modules/outDocument/pages/RejectedOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocRejected.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.issue,
    name: ROUTES_DISPLAY.outDocIssue.name,
    component: () => import('@/modules/outDocument/pages/IssueOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocIssue.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.issueOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.keepNumber,
    name: ROUTES_DISPLAY.keepNumberOD.name,
    component: () => import('@/modules/outDocument/pages/RegisterOutDocNumber.vue'),
    meta: {
      title: ROUTES_DISPLAY.keepNumberOD.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.manageKeepNumber]
    }
  },
  {
    path: ROUTE_PATHS.outDoc.reRegisterDoc,
    name: ROUTES_DISPLAY.outDocReRegister.name,
    component: () => import('@/modules/outDocument/pages/ReRegisterOutDoc.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocReRegister.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.registerOutDoc]
    }
  }
]
