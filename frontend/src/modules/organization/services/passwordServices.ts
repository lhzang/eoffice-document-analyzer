import { ChangePasswordApi, type ChangePasswordRequest } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const passwordApi = new ChangePasswordApi(apiClientConfig)
export const passwordServices = {
  changePassword: async (payload: ChangePasswordRequest) => {
    const res = await passwordApi.changePassword(payload)
    return res?.data
  }
}
