import type { TResponseListData } from '@/shared/models/common'
import { cleanObject } from '@/shared/utils/common'
import { GET, PATCH } from '../config/axiosClient'
import type {
  TApproveSignatureItem,
  TProcessApproveRequesPayload,
  TProcessMultipleSignatures
} from '../model/types'

export const esignService = {
  getWaitForApproveSignatureList: (
    page: number,
    pageSize: number,
    search?: string
  ): Promise<TResponseListData<TApproveSignatureItem>> =>
    GET(
      `/api/signature-image/to-review-accounts`,
      cleanObject({
        page,
        pageSize,
        search: search?.trim()
          ? JSON.stringify({
              accountId: search?.trim(),
              'info.name': search?.trim()
            })
          : undefined
      })
    ),

  getProcessedSignatureList: (
    page: number,
    pageSize: number,
    search?: string
  ): Promise<TResponseListData<TApproveSignatureItem>> =>
    GET(
      `/api/signature-image/reviewed-accounts`,
      cleanObject({
        page,
        pageSize,
        search: search?.trim()
          ? JSON.stringify({
              accountId: search?.trim(),
              'info.name': search?.trim()
            })
          : undefined
      })
    ),

  processApproveRequest: (payload: TProcessApproveRequesPayload): Promise<void> =>
    PATCH('/api/signature-image/review', cleanObject(payload)),
  resetAllProcessedSignature: (): Promise<void> => PATCH('/signature-image/review/reset-all'),
  processMultipleSignatures: (payload: TProcessMultipleSignatures): Promise<void> =>
    PATCH('/signature-image/review/accept-all', payload)
}
