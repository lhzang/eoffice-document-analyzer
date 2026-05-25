import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { GetTraceabilityDetailTypeEnum, TraceabilityDetailVM } from '@/shared/services/api'
import { sharedIndocService } from '@/shared/services/indoc/in-documentServices'

export const useGetDetailHistoryNode = (
  targetId: MaybeRefOrGetter<string>,
  type: MaybeRefOrGetter<GetTraceabilityDetailTypeEnum>,
  options?: QueryOptions<TraceabilityDetailVM, TServerError>
) => {
  return useQuery<TraceabilityDetailVM, TServerError>({
    queryKey: computed(() => ['get-detail-history-node', targetId, type]),
    queryFn: () => sharedIndocService.getDetailHistoryNode(toValue(targetId), toValue(type)),
    ...options
  })
}
