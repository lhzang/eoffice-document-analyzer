import type { TAppFeatureKey } from '@/shared/constants/permission'
import { AccessControlApi } from '../api/api'
import { apiClientConfig } from '../apiClientConfig'

const accessControlApi = new AccessControlApi(apiClientConfig)

export interface TUserUnitPermissionParams {
  permission: string
}

export interface TUnitPermissionOption {
  value: string
  label: string
}

const sharedAccessControlService = {
  getAffectUnitBySelfPermission: async (payload: TUserUnitPermissionParams) => {
    const { permission } = payload
    const result = await accessControlApi.getTenantsAffected(permission)
    return result?.data
  },
  getAffectUnitByPermission: async (positionId: string, permission: TAppFeatureKey) => {
    const result = await accessControlApi.getTenantsAffectedBySubject(positionId, permission)
    return result?.data
  },
  getPermissionsInUnit: async (id: string) => {
    const res = await accessControlApi.getPermissionsInUnit(id)
    return res.data
  }
}

export default sharedAccessControlService
