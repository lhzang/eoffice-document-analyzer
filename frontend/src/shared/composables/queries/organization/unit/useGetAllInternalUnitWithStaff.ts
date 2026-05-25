import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { QueryOptions, TStaffLeaderFilterMode } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetAllInternalUnitWithStaff = (
  filterLeaderMode?: MaybeRefOrGetter<TStaffLeaderFilterMode | undefined>,
  permissionFilter?: MaybeRefOrGetter<TAppFeatureKey | undefined>,
  options?: QueryOptions<TTreeUnitWithStaffNode[], TServerError>
) => {
  return useQuery<TTreeUnitWithStaffNode[], TServerError>({
    queryKey: ['getAllTreeInternalWithStaff'],
    queryFn: () =>
      sharedUnitService.getTreeInternalUnitWithStaffs(
        toValue(filterLeaderMode),
        toValue(permissionFilter)
      ),
    ...options
  })
}
