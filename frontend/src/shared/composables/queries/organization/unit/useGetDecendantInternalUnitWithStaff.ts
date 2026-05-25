import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { QueryOptions, TStaffLeaderFilterMode } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDecendantInternalUnitWithStaff = (
  rootId: MaybeRefOrGetter<string>,
  filterLeaderMode?: TStaffLeaderFilterMode,
  permissionFilter?: TAppFeatureKey,

  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: ['getDecendantTreeInternalWithStaff', rootId],
    queryFn: () =>
      sharedUnitService.getTreeInternalUnitWithStaffs(
        filterLeaderMode,
        permissionFilter,
        toValue(rootId)
      ),
    ...options
  })
}
