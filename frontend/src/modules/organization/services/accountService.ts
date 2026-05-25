import type { TCommonGetListParams } from '@/shared/models/common'
import {
  AccountApi,
  type CreateAccountRequest,
  type UpdateAccountRequest
} from '@/shared/services/api/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'

const accountApi = new AccountApi(apiClientConfig)

const accountService = {
  async getAccountDetail(accountId: string) {
    const result = await accountApi.getAccountDetail(accountId)
    return result.data
  },
  async createAccount(payload: CreateAccountRequest) {
    const result = await accountApi.createAccount(payload)
    return result.data
  },
  async updateAccountInfo(accountId: string, payload: UpdateAccountRequest) {
    const res = await accountApi.updateAccount(accountId, payload)
    return res.data
  },
  async getAccountList(payload: TCommonGetListParams) {
    const { search, page, size, sort } = payload
    const pageble = { page, size, sort }
    const res = await accountApi.getAccessibleStaff(pageble, search)
    return res.data
  },
  async getAllAccountList(payload: TCommonGetListParams) {
    const { search, page, size, sort } = payload
    const pageble = { page, size, sort }

    const res = await accountApi.getAccessibleStaff(pageble, search)
    return res.data
  },
  async deleteAccount(accountId: string) {
    const res = await accountApi.deleteAccount(accountId)
    return res.data
  }
}

export default accountService
