import {
  PositionApi,
  type CreatePositionRequest,
  type UpdatePositionRequest
} from '@/shared/services/api/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const positionApi = new PositionApi(apiClientConfig)

const positionService = {
  async updatePosition(positonId: string, payload: UpdatePositionRequest) {
    const res = await positionApi.updatePosition(positonId, payload)
    return res.data
  },
  async createPosition(payload: CreatePositionRequest) {
    const res = await positionApi.createPosition(payload)
    return res.data
  },
  async deletePosition(positonId: string) {
    const res = await positionApi.deletePosition(positonId)
    return res.data
  }
}
export default positionService
