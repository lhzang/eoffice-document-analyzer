import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListInternalDocPayload, TWaitForProcessStatusValue } from '../../models/document'
import { internalDocServices } from '../../services/document'

export const useGetWaitProcessInternalDocList = (
  getListPayload: MaybeRefOrGetter<TGetListInternalDocPayload>,
  status: MaybeRefOrGetter<TWaitForProcessStatusValue>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getProcessInternalDocList', getListPayload, status],
    queryFn: () =>
      internalDocServices.getWaitForProcressList(toValue(getListPayload), toValue(status)),
    ...options
  })
}
