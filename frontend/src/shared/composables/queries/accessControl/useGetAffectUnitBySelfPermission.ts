import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { QueryWithKeyOptions } from '@/shared/models/common'
import sharedAccessControlService from '@/shared/services/accesscontrol/accessControlService'
import type { TenantWithNameOnlyVM } from '@/shared/services/api'

export const useGetAffectUnitBySelfPermission = (
  permission: MaybeRefOrGetter<TAppFeatureKey>,
  options?: QueryWithKeyOptions<TenantWithNameOnlyVM[], TServerError>,
  additionalKey?: MaybeRefOrGetter<string>
) => {
  return useQuery<TenantWithNameOnlyVM[], TServerError>({
    queryKey: additionalKey
      ? ['units-by-self-permission', permission, additionalKey]
      : ['units-by-self-permission', permission],
    queryFn: () =>
      sharedAccessControlService.getAffectUnitBySelfPermission({
        permission: toValue(permission)
      }),
    ...options
  })
}
