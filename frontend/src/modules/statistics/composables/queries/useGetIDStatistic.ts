import type { QueryOptions } from '@/shared/models/common'
import type { GetIncomingDashboardUnitTypeEnum, IncomingDashboardVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import statisticServices from '../../statisticServices'

export const useGetIDStatistic = (
  unitType: MaybeRefOrGetter<GetIncomingDashboardUnitTypeEnum>,
  options?: QueryOptions<IncomingDashboardVM[], TServerError>
) => {
  return useQuery<IncomingDashboardVM[], TServerError>({
    queryKey: ['getIDStatistic', unitType],
    queryFn: () => statisticServices.getStatistic(toValue(unitType)),
    ...options
  })
}
