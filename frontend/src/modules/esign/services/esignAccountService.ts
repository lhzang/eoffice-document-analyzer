import { DELETE, GET, PATCH, POST } from '../config/axiosClient'
import type {
  CreateEsignAccountRequest,
  GetEsignAccountResponse,
  ToggleUsbAccountRequest
} from '../model/esignAccount'

export const esignAccountService = {
  getEsignAccount: (accountId?: string | undefined): Promise<GetEsignAccountResponse> =>
    GET('/api/credentials/signing-accounts', { accountId }),

  createEsignAccount: ({ accountId, phone, simType, username }: CreateEsignAccountRequest) => {
  const requestBody =
    simType === 'vnpt_remote'
      ? {
          accountId,
          username,
          certIdentifier: ''
        }
      : simType === 'vt_remote'
      ? {
          accountId,
          userId: username
        }
      : {
          accountId,
          msisdn: phone
        }

    return POST(`/api/credentials/${simType}/accounts`, requestBody)
  },

  deleteEsignAccount: (simType: string, accountId: string): Promise<void> =>
    DELETE(`/api/credentials/${simType}/accounts/${accountId}`),

  toggleUsbAccount: (body: ToggleUsbAccountRequest): Promise<string> =>
    PATCH('/api/credentials/usb_token', body, { isFullPath: true })
}
