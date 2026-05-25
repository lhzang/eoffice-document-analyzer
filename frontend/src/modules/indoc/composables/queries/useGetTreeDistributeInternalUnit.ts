import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery, type QueryOptions } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetTreeDistributeInternalUnit = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>,
  additionalKey?: MaybeRefOrGetter<string>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: additionalKey
      ? ['getTreeDistributeInternalUnit', toValue(unitId), additionalKey]
      : ['getTreeDistributeInternalUnit', toValue(unitId)],
    queryFn: () => sharedUnitService.getTreeDistributeInternalUnit(toValue(unitId)),
    ...options
  })
}
