import { GroupApi, type CreateGroupCommand, type UpdateGroupRequest } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const unitGroupApi = new GroupApi(apiClientConfig)
export const unitGroupService = {
  create: async (payload: CreateGroupCommand) => {
    const res = await unitGroupApi.createNewGroup(payload)
  },
  update: async (id: string, body: UpdateGroupRequest) => {
    const res = await unitGroupApi.updateGroup(id, body)
  },
  delete: async (id: string) => {
    const res = await unitGroupApi.deleteGroup(id)
  }
}
