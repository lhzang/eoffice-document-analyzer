import { FlowApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const flowApi = new FlowApi(apiClientConfig)

export const flowService = {
  getFlow: async (unitId: string) => {
    const result = await flowApi.getFlow(unitId)
    return result.data
  }
}
