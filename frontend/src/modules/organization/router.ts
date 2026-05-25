import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const organizationRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.admin.staffManagementDetail,
    name: ROUTES_DISPLAY.staffDetail.name,
    component: () => import('@/modules/organization/pages/StaffDetail.vue'),
    meta: {
      title: ROUTES_DISPLAY.staffDetail.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.viewPosition]
    }
  },
  {
    path: ROUTE_PATHS.admin.staffManagement,
    name: ROUTES_DISPLAY.staffManagement.name,
    component: () => import('@/modules/organization/pages/StaffManagement.vue'),
    meta: {
      title: ROUTES_DISPLAY.staffManagement.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.viewPosition]
    }
  },

  {
    path: ROUTE_PATHS.admin.unitManagement,
    name: ROUTES_DISPLAY.unitManagement.name,
    component: () => import('@/modules/organization/pages/UnitManagement.vue'),
    meta: {
      title: ROUTES_DISPLAY.unitManagement.lable,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.viewUnit]
    }
  },
  {
    path: ROUTE_PATHS.admin.outDocSignTemplate,
    name: ROUTES_DISPLAY.outDocSignTemplate.name,
    component: () => import('@/modules/organization/pages/OutDocSignTemplate.vue'),
    meta: {
      title: ROUTES_DISPLAY.outDocSignTemplate.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.manageSignTemplateOutDoc]
    }
  },
  {
    path: ROUTE_PATHS.admin.secretaryManagement,
    name: ROUTES_DISPLAY.secretaryManagement.name,
    component: () => import('@/modules/organization/pages/SecretaryConfig.vue'),
    meta: {
      title: ROUTES_DISPLAY.secretaryManagement.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.configSecretary]
    }
  },
  {
    path: ROUTE_PATHS.admin.inDocFlowConfig,
    name: ROUTES_DISPLAY.inDocFlow.name,
    component: () => import('@/modules/organization/pages/InDocFlowConfig.vue'),
    meta: {
      title: ROUTES_DISPLAY.inDocFlow.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.viewIndocFlow]
    }
  },
  {
    path: ROUTE_PATHS.admin.authorizationConfig,
    name: ROUTES_DISPLAY.authorizationConfig.name,
    component: () => import('@/modules/organization/pages/AuthorizaionConfig.vue'),
    meta: {
      title: ROUTES_DISPLAY.authorizationConfig.label,
      excludeEnvs: [],
      availablePermissions: [APP_PERMISSION_VALUES.systemManage]
    }
  }
]
