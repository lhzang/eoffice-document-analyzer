import { intersection } from 'lodash-es'
import 'vue-router'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { TEnvs } from './config/app-config'
import { inDocumentRouter } from './modules/indoc/router'
import { useAuth } from './shared/composables/useAuth'
import type { TAppFeatureKey } from './shared/constants/permission'
import { ROUTES_DISPLAY, ROUTE_PATHS } from './shared/constants/router'
import { useUserProfileStore } from './shared/stores/userProfileStore'
import { checkMatchEnv } from './shared/utils/common'

const routes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.login,
    name: ROUTES_DISPLAY.login.name,
    component: () => import('@/core/pages/LoginPage.vue'),
    meta: {
      ignoreAuth: true,
      title: ROUTES_DISPLAY.login.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: '/oauth2-callback',
    name: 'LoginCallback',
    component: () => import('@/core/pages/LoginCallback.vue'),
    meta: {
      ignoreAuth: true,
      title: ROUTES_DISPLAY.login.label,
      excludeEnvs: [],
      availablePermissions: []
    }
  },
  {
    path: '/',
    component: () => import('@/core/layout/MainView.vue'),
    redirect: ROUTE_PATHS.incomingDoc.inDocProcessing,
    children: [
      {
        path: ROUTE_PATHS.forbiden,
        name: ROUTES_DISPLAY.forbiden.name,
        component: () => import('@/core/pages/NotPermission.vue'),
        meta: {
          title: ROUTES_DISPLAY.forbiden.label,
          excludeEnvs: [],
          availablePermissions: []
        }
      },
      ...inDocumentRouter,
      {
        path: '/:pathMatch(.*)*',
        name: ROUTES_DISPLAY.notFound.name,
        component: () => import('@/core/pages/NotFound.vue'),
        meta: {
          title: ROUTES_DISPLAY.notFound.label,
          excludeEnvs: [],
          availablePermissions: []
        }
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const { user } = useUserProfileStore()
  const auth = useAuth()
  if (to.meta.ignoreAuth || checkMatchEnv(['mock'])) return true
  if (checkMatchEnv(to?.meta?.excludeEnvs))
    return {
      name: ROUTES_DISPLAY?.notFound?.name
    }
  if (
    to?.meta?.availablePermissions?.length &&
    !intersection(to?.meta?.availablePermissions, user?.currentPermission)?.length
  )
    return {
      name: ROUTES_DISPLAY?.forbiden?.name
    }
  if (
    to?.name === ROUTES_DISPLAY.signatureImageReview.name && (!user?.bsignRoles?.length ||
      !user?.bsignRoles?.includes('Admin'))
  ) return {
    name: ROUTES_DISPLAY?.forbiden?.name
  }

  const oidcUser = await auth.getUser()
  if (!oidcUser || oidcUser?.expired) {
    await auth.login()
    // return { name: ROUTES_DISPLAY.login.name }
  }
})

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    ignoreAuth?: boolean
    //restrict router by envs, permision, empty mean no check
    excludeEnvs: TEnvs[]
    availablePermissions: TAppFeatureKey[]
  }
}
