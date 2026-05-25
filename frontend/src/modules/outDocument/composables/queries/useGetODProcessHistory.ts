import type { QueryOptions } from '@/shared/models/common'
import type { ProcessingHistoryVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { outDocServices } from '../../services/document'

export const useGetODProcessHistory = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<ProcessingHistoryVM, TServerError>
) => {
  return useQuery<ProcessingHistoryVM, TServerError>({
    queryKey: ['getOutDocProcessHistory', id],
    queryFn: () => outDocServices.getProcessHistory(toValue(id)),
    ...options
  })
}
