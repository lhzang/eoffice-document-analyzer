import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListInternalDocPayload } from '../../models/document'
import { internalDocServices } from '../../services/document'

export const useGetRejectedInternalDocList = (
  getListPayload: MaybeRefOrGetter<TGetListInternalDocPayload>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getRectedInternalDocList', getListPayload, status],
    queryFn: () => internalDocServices.getRejectedList(toValue(getListPayload)),
    ...options
  })
}
