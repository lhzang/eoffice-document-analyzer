import { AccountApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const accountApi = new AccountApi(apiClientConfig)
const userService = {
  async getUser() {
    const response = await accountApi.getCurrentAccountDetail()
    return response.data || null
  }
}
export default userService
