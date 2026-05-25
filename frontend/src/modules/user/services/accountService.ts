import type { ChangePasswordRequest, UpdateAccountRequest } from '@/shared/services/api'
import { AccountApi, ChangePasswordApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const accountApi = new AccountApi(apiClientConfig)
const changePasswordApi = new ChangePasswordApi(apiClientConfig)

export const accountService = {
  async changePassword(payload: ChangePasswordRequest) {
    await changePasswordApi.changePassword(payload)
  },
  async changeAvatar(accountId: string, profilePic: File) {
    await accountApi.updateAccountProfilePic(accountId, profilePic)
  },
  async updateAccountInfo(accountId: string, payload: UpdateAccountRequest) {
    const res = await accountApi.updateAccount(accountId, payload)
    return res.data
  }
}
