import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListOutDocPayload, TWaitForProcessStatusValue } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useGetWaitProcessODList = (
  getListPayload: MaybeRefOrGetter<TGetListOutDocPayload>,
  status: MaybeRefOrGetter<TWaitForProcessStatusValue>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getProcessOutDocList', getListPayload, status],
    queryFn: () => outDocServices.getWaitForProcressList(toValue(getListPayload), toValue(status)),
    ...options
  })
}
