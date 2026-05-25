import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import type { UseQueryOptions } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

export const useGetUnitTreeForManagement = (
  limit?: number,
  options?: UseQueryOptions<TTreeUnitWithStaffNode[], AxiosError>
) => {
  return useQuery<TTreeUnitWithStaffNode[], AxiosError>({
    queryKey: ['getUnitTreeForManagement', limit],
    queryFn: () => sharedUnitService.getUnitTreeForManagement(limit),
    ...options
  })
}
