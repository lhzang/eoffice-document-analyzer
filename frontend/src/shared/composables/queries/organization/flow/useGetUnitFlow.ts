import type { QueryOptions } from '@/shared/models/common'
import type { FlowDetailVM } from '@/shared/services/api'
import { flowService } from '@/shared/services/organization/flowServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetUnitFlow = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<FlowDetailVM, TServerError>
) => {
  return useQuery<FlowDetailVM, TServerError>({
    queryKey: ['getUnitFlow', unitId],
    queryFn: () => flowService.getFlow(toValue(unitId)),
    ...options
  })
}
