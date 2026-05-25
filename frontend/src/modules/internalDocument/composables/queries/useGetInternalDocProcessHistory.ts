import type { QueryOptions } from '@/shared/models/common'
import type { ProcessingHistoryVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { internalDocServices } from '../../services/document'

export const useGetInternalDocProcessHistory = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<ProcessingHistoryVM, TServerError>
) => {
  return useQuery<ProcessingHistoryVM, TServerError>({
    queryKey: ['getInternalDocProcessHistory', id],
    queryFn: () => internalDocServices.getProcessHistory(toValue(id)),
    ...options
  })
}
