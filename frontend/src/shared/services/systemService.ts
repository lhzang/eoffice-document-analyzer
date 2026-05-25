import { SystemApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const systemApi = new SystemApi(apiClientConfig)
export const systemService = {
  getSystemConfig: async () => {
    const result = await systemApi.getSystemConfig()
    return result?.data
  }
}
