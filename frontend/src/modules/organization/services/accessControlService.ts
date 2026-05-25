import type { TCommonOptionalGetListParams } from '@/shared/models/common'
import {
  AccessControlApi,
  type AssignPermissionToSubjectRequest,
  type AssignRoleToSubjectRequest,
  type CreateRoleCommand,
  type UpdateRoleRequest,
  type UpdateSubjectRequest
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { mappingServerPaginatedData } from '@/shared/utils/common'
const accessControllAPI = new AccessControlApi(apiClientConfig)

const accessControlService = {
  getListRoles: async (getListPayload: TCommonOptionalGetListParams) => {
    const { page, size, search, sort } = getListPayload
    const result = await accessControllAPI.getAllRoles(page, size, sort, search)
    return mappingServerPaginatedData(result.data)
  },
  getListPermission: async (getListPayload: TCommonOptionalGetListParams) => {
    const { page, size, search } = getListPayload
    const result = await accessControllAPI.getAllPermissions(page, size)
    return result?.data?.items?.sort((a, b) => a?.permission?.localeCompare(b?.permission))
  },
  getDetailRole: async (id: string) => {
    const res = await accessControllAPI?.getRoleById(id)
    if (res?.data?.scopedPermissions) {
      res?.data?.scopedPermissions?.sort((a, b) => a?.permission?.localeCompare(b?.permission))
    }
    return res.data
  },
  createRole: async (payload: CreateRoleCommand) => {
    const res = await accessControllAPI.createRole(payload)
    return res.data
  },
  updateRole: async (id: string, payload: UpdateRoleRequest) => {
    const res = await accessControllAPI.updateRole(id, payload)
    return res.data
  },
  assignPermissionsToSubject: async (
    positionId: string,
    payload: AssignPermissionToSubjectRequest
  ) => {
    const res = await accessControllAPI.assignPermissionToSubject(positionId, payload)
    return res.data
  },
  assignRolesToSubject: async (positionId: string, payload: AssignRoleToSubjectRequest) => {
    const res = await accessControllAPI.assignRoleToSubject(positionId, payload)
    return res.data
  },
  updateRoleAndPermissionOfPosition: async (positionId: string, payload: UpdateSubjectRequest) => {
    const res = await accessControllAPI.updateSubject(positionId, payload)
  },
  deleteRole: async (id: string) => {
    const res = await accessControllAPI.deleteRole(id)
    return res?.data
  }
}

export default accessControlService
