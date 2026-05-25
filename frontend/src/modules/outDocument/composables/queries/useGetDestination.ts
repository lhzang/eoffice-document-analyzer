import type { QueryOptions } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { outDocDestinationService } from '../../services/destination'

export const useGetDestination = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>,
  additionalKey?: MaybeRefOrGetter<string>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: additionalKey
      ? ['getTreeDestination', unitId, additionalKey]
      : ['getTreeDestination', unitId],
    queryFn: () => outDocDestinationService.getDestinationsTree(toValue(unitId)),
    ...options
  })
}
