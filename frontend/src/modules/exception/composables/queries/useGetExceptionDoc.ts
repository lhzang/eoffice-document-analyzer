import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery, type QueryOptions } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListExceptionDocPayload } from '../../models/updateIssuedDoc'
import { exceptionServices } from '../../services/updateIssuedDoc'

export const useGetExceptionDoc = (
  getListPayload: MaybeRefOrGetter<TGetListExceptionDocPayload>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getExceptionDocList', getListPayload],
    queryFn: () => exceptionServices.getExceptionDocument(toValue(getListPayload)),
    ...options
  })
}
