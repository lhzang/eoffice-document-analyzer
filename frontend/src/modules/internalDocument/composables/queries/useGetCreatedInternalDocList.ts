import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListInternalDocPayload } from '../../models/document'
import { internalDocServices } from '../../services/document'

export const useGetCreatedInternalDocList = (
  getListPayload: MaybeRefOrGetter<TGetListInternalDocPayload>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getCreatedInternalDocList', getListPayload],
    queryFn: () => internalDocServices.getCreatedList(toValue(getListPayload)),
    ...options
  })
}
