import type { QueryOptions } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetTreeAssignInternalUnit = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>,
  additionalKey?: MaybeRefOrGetter<string>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: additionalKey
      ? ['getTreeAssignInternalUnit', toValue(unitId), additionalKey]
      : ['getTreeAssignInternalUnit', toValue(unitId)],
    queryFn: () => sharedUnitService.getTreeAssignInternalUnit(toValue(unitId)),
    ...options
  })
}
