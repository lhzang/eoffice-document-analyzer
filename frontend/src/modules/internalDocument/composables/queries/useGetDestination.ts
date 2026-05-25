import type { QueryOptions } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter } from 'vue'
import { internalDocDestinationService } from '../../services/destination'

export const useGetDestination = (
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>,
  additionalKey?: MaybeRefOrGetter<string>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: additionalKey ? ['getTreeDestination', additionalKey] : ['getTreeDestination'],
    queryFn: () => internalDocDestinationService.getDestinationsTree(),
    ...options
  })
}
