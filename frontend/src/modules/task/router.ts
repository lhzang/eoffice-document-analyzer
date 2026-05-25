import type { RouteRecordRaw } from 'vue-router'

import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const taskRouter: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.task.createTask,
    name: ROUTES_DISPLAY.createTask.label,
    component: () => import('@/modules/task/pages/CreateTask.vue'),
    meta: {
      title: ROUTES_DISPLAY.createTask.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.task.taskList,
    name: ROUTES_DISPLAY.taskList.label,
    component: () => import('@/modules/task/pages/TaskList.vue'),
    meta: {
      title: ROUTES_DISPLAY.taskList.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: `${ROUTE_PATHS.task.taskDetail}/:id`,
    name: ROUTES_DISPLAY.taskDetail.name,
    component: () => import('@/modules/task/pages/TaskDetail.vue'),
    meta: {
      title: ROUTES_DISPLAY.taskDetail.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  }
]
