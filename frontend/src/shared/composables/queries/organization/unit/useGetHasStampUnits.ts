import type { QueryOptions } from '@/shared/models/common'
import type { AdminUnitVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'

export const useGetHasStampUnits = (options?: QueryOptions<AdminUnitVM[], TServerError>) => {
  return useQuery<AdminUnitVM[], TServerError>({
    queryKey: ['getHasStampUnits'],
    queryFn: async () => await sharedUnitService.getHasStampUnits(),
    ...options
  })
}
