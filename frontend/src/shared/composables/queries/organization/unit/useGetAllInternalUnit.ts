import type { QueryOptions } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'

export const useGetTreeInternalUnit = (
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: ['getTreeInternalUnit'],
    queryFn: () => sharedUnitService.getTreeInternalUnit(),
    ...options
  })
}
