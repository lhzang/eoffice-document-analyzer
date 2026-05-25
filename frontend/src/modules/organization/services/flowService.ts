import { FlowApi, type UpdateFlowCommand } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const flowApi = new FlowApi(apiClientConfig)

export const flowService = {
  updateFlow: async (payload: UpdateFlowCommand) => {
    const result = await flowApi.updateFlow(payload)
    return result.data
  }
}
