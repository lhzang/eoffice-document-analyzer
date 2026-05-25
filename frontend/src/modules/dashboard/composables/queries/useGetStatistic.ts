import { useQuery } from '@tanstack/vue-query'

import type { QueryOptions } from '@/shared/models/common'
import type { DashboardResponse } from '@/shared/services/api'
import { dashBoardServices } from '../../services'

export const useGetStatistic = (options?: QueryOptions<DashboardResponse, TServerError>) => {
  return useQuery<DashboardResponse, TServerError>({
    queryKey: ['get-dashboard'],
    queryFn: () => dashBoardServices.getDashboard(),
    ...options
  })
}
