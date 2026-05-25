import {
  GetIncomingDashboardUnitTypeEnum,
  IncomingDocumentStatisticsApi
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const statisticAPI = new IncomingDocumentStatisticsApi(apiClientConfig)

const statisticServices = {
  getStatistic: async (unitType: GetIncomingDashboardUnitTypeEnum) => {
    const res = await statisticAPI.getIncomingDashboard(unitType)
    return res?.data
  },

  getByGroup: async (groupId: string) => {
    const res = await statisticAPI.getGroupStats(groupId)
    return res?.data
  },

  getByUnit: async (unitId: string) => {
    const res = await statisticAPI.getUnitStats(unitId)
    return res?.data
  }
}
export default statisticServices
