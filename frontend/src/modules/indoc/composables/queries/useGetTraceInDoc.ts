import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { TraceabilityNodeVM } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useGetTraceInDoc = (
  documentId: MaybeRefOrGetter<string>,
  staffId?: MaybeRefOrGetter<string | undefined>,
  options?: QueryOptions<TraceabilityNodeVM, TServerError>
) => {
  return useQuery<TraceabilityNodeVM, TServerError>({
    queryKey: computed(() => ['get-trace-in-doc', documentId, staffId]),
    queryFn: () => inDocService.getTraceInDoc(toValue(documentId), toValue(staffId)),
    ...options
  })
}
