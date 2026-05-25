import type { RouteRecordRaw } from 'vue-router'

import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from '@/shared/constants/router'

export const carRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.car.register,
    name: ROUTES_DISPLAY.carRegister.name,
    component: () => import('./pages/CarRegister.vue'),
    meta: {
      title: ROUTES_DISPLAY.carRegister.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.car.list,
    name: ROUTES_DISPLAY.carList.name,
    component: () => import('./pages/CarList.vue'),
    meta: {
      title: ROUTES_DISPLAY.carList.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: [
        APP_PERMISSION_VALUES.viewStaffCar,
        APP_PERMISSION_VALUES.viewCollaboratorCar,
        APP_PERMISSION_VALUES.viewGuestCar,
        APP_PERMISSION_VALUES.viewUniCar,
        APP_PERMISSION_VALUES.viewStaffCar
      ]
    }
  },
  {
    path: ROUTE_PATHS.car.requestList,
    name: ROUTES_DISPLAY.carRequestList.name,
    component: () => import('./pages/CarRequestList.vue'),
    meta: {
      title: ROUTES_DISPLAY.carRequestList.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: [
        APP_PERMISSION_VALUES.evaluateGuestCar,
        APP_PERMISSION_VALUES.evaluateStaffCar
      ]
    }
  },
  {
    path: ROUTE_PATHS.car.createdList,
    name: ROUTES_DISPLAY.carCreatedList.name,
    component: () => import('./pages/CarCreatedRegister.vue'),
    meta: {
      title: ROUTES_DISPLAY.carCreatedList.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: []
    }
  },
  {
    path: ROUTE_PATHS.car.approvedelagation,
    name: ROUTES_DISPLAY.carApprovedelagation.name,
    component: () => import('./pages/CarApproveDelagation.vue'),
    meta: {
      title: ROUTES_DISPLAY.carApprovedelagation.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: [
        APP_PERMISSION_VALUES.grantGuestCar,
        APP_PERMISSION_VALUES.grantStaffCar,
        APP_PERMISSION_VALUES.grantStudentCar,
        APP_PERMISSION_VALUES.grantUniCar,
        APP_PERMISSION_VALUES.grantCollaboratorCar
      ]
    }
  },
  {
    path: ROUTE_PATHS.car.delagation,
    name: ROUTES_DISPLAY.carDelagation.name,
    component: () => import('./pages/CarDelagation.vue'),
    meta: {
      title: ROUTES_DISPLAY.carDelagation.label,
      excludeEnvs: ['hmu_staging', 'hmuh_staging', 'prod_hmu', 'prod_hmuh'],
      availablePermissions: [APP_PERMISSION_VALUES.manageCar]
    }
  }
]
