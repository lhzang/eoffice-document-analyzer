import { GET, PATCH } from '../config/axiosClient'
import type { EditUserAccountRequest, UserAccountResponse } from '../model/userAccount'

export const userAccountService = {
  getUserAccount: (email?: string): Promise<UserAccountResponse> =>
    GET(`/api/account/accounts/${email}`),

  editUserAccount: (email: string, body: EditUserAccountRequest): Promise<string> =>
    PATCH(`/api/account/accounts/?accountId=${email}`, body)
}
