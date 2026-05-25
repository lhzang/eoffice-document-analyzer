import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListOutDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useGetCreatedODList = (
  getListPayload: MaybeRefOrGetter<TGetListOutDocPayload>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getCreatedOutDocList', getListPayload],
    queryFn: () => outDocServices.getCreatedList(toValue(getListPayload)),
    ...options
  })
}
