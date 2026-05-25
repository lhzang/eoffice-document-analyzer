import {
  SystemApi,
  UpdateSystemRoleConfigRoleConfigCollaboratorEnum,
  UpdateSystemRoleConfigRoleConfigDirectorEnum,
  UpdateSystemRoleConfigRoleConfigLeaderEnum,
  UpdateSystemRoleConfigRoleConfigViewerEnum
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TUpdateSystemConfigParams } from '../models/type'

const systemApi = new SystemApi(apiClientConfig)
export const systemService = {
  updateSystemRoleConfig: async (params: TUpdateSystemConfigParams) => {
    const res = await systemApi.updateSystemRoleConfig(
      params.unitName,
      params.mainColor,
      params.backgroundColor,
      params.roleConfigDirector as UpdateSystemRoleConfigRoleConfigDirectorEnum,
      params.roleConfigLeader as UpdateSystemRoleConfigRoleConfigLeaderEnum,
      params.roleConfigCollaborator as UpdateSystemRoleConfigRoleConfigCollaboratorEnum,
      params.roleConfigViewer as UpdateSystemRoleConfigRoleConfigViewerEnum,
      params.logo,
      { method: 'PATCH' }
    )
    return res.data
  }
}
