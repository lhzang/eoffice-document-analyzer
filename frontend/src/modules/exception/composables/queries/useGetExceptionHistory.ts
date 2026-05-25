import type { PaginatedResultExceptionHistoryVM } from '@/shared/services/api'
import { useQuery, type QueryOptions } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetExceptionHistoryPayload } from '../../models/exceptionHistory'
import { exceptionServices } from '../../services/updateIssuedDoc'

export const useGetExceptionHistory = (
  getListPayLoad: MaybeRefOrGetter<TGetExceptionHistoryPayload>,
  options?: QueryOptions<PaginatedResultExceptionHistoryVM, TServerError>
) => {
  return useQuery<PaginatedResultExceptionHistoryVM, TServerError>({
    queryKey: ['getExceptionHistory', getListPayLoad],
    queryFn: () => exceptionServices.getExceptionHistory(toValue(getListPayLoad)),
    ...options
  })
}
