import type { TCommonGetListParams } from '@/shared/models/common'
import { SecretaryConfigApi, type ConfigureSecretaryRequest } from '@/shared/services/api/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const secretaryApi = new SecretaryConfigApi(apiClientConfig)

const secretaryService = {
  async getListSecretaryConfig(payload: TCommonGetListParams) {
    const res = await secretaryApi.getSecretaryConfig(payload)
    return res.data
  },
  async configSecretary(payload: ConfigureSecretaryRequest) {
    const res = await secretaryApi.configureSecretary(payload)
    return res.data
  },
  async addSecretary(payload: ConfigureSecretaryRequest) {
    const res = await secretaryApi.appendSecretary(payload)
    return res.data
  },
  async deleteConfigSecretary(leaderId: string) {
    const res = await secretaryApi.deleteSecretaryRelationships(leaderId)
    return res.data
  }
}
export default secretaryService
