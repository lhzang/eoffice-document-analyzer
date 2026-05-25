import type { QueryOptions } from '@/shared/models/common'
import type { IncomingUnitStatisticsVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import statisticServices from '../../statisticServices'

export const useGetIDStatisticByGroup = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<IncomingUnitStatisticsVM, TServerError>
) => {
  return useQuery<IncomingUnitStatisticsVM, TServerError>({
    queryKey: ['getIDStatisticByGroup', id],
    queryFn: () => statisticServices.getByGroup(toValue(id)),
    ...options
  })
}
