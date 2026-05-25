import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TApproveSignatureItem } from '../../model/types'
import { esignService } from '../../services/signatureApproveService'

type TGetListPayload = {
  page: number
  pageSize: number
  search?: string
}

export const useGetProcessedApproveSignatureList = (
  payload: MaybeRefOrGetter<TGetListPayload>,
  options?: QueryOptions<TResponseListData<TApproveSignatureItem>, TServerError>
) =>
  useQuery<TResponseListData<TApproveSignatureItem>, TServerError>({
    queryKey: ['getProcessedApproveSignatures', payload],
    queryFn: () => {
      const { page, pageSize, search } = toValue(payload)
      return esignService.getProcessedSignatureList(page, pageSize, search)
    },
    ...options
  })
