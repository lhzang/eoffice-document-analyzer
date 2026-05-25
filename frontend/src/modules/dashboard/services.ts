import { DashboardApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const dashboardApi = new DashboardApi(apiClientConfig)
export const dashBoardServices = {
  getDashboard: async () => {
    const res = await dashboardApi.getDashboard()
    return res?.data
  }
}
