import type { QueryOptions } from '@/shared/models/common'
import type { TraceabilityNodeVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { outDocServices } from '../../services/document'

export const useGetDestinationProcessHistory = (
  documentId: MaybeRefOrGetter<string>,
  destinationId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TraceabilityNodeVM, TServerError>
) => {
  return useQuery<TraceabilityNodeVM, TServerError>({
    queryKey: ['getDestinationProcessHistory', documentId, destinationId],
    queryFn: async () =>
      outDocServices.getDestinationProcessHistory(toValue(documentId), toValue(destinationId)),
    ...options
  })
}
