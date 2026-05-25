import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const recordsRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.records.recordsList,
    name: ROUTES_DISPLAY.recordsList.name,
    component: () => import('@/modules/record/pages/ListRecordsCategory.vue'),
    meta: { title: ROUTES_DISPLAY.recordsList.label }
  },
  {
    path: ROUTE_PATHS.records.personalRecords,
    name: ROUTES_DISPLAY.personalRecords.name,
    component: () => import('@/modules/record/pages/ListRecordsPersonal.vue'),
    meta: { title: ROUTES_DISPLAY.personalRecords.label }
  },
  {
    path: ROUTE_PATHS.records.archiveRecords,
    name: ROUTES_DISPLAY.archiveRecords.name,
    component: () => import('@/modules/record/pages/ListRecordsArchive.vue'),
    meta: { title: ROUTES_DISPLAY.archiveRecords.label }
  }
]
