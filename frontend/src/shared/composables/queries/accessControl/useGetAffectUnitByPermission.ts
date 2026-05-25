import { useQuery } from '@tanstack/vue-query'
import { omit } from 'lodash-es'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { QueryWithKeyOptions } from '@/shared/models/common'
import sharedAccessControlService from '@/shared/services/accesscontrol/accessControlService'
import type { TenantWithNameOnlyVM } from '@/shared/services/api'

export const useGetAffectUnitByPermission = (
  positionId: MaybeRefOrGetter<string>,
  permission: MaybeRefOrGetter<TAppFeatureKey>,
  options?: QueryWithKeyOptions<TenantWithNameOnlyVM[], TServerError>
) => {
  return useQuery<TenantWithNameOnlyVM[], TServerError>({
    queryKey: ['units-by-permission', positionId, permission],
    queryFn: () =>
      sharedAccessControlService.getAffectUnitByPermission(
        toValue(positionId),
        toValue(permission)
      ),
    ...omit(options, 'queryKey')
  })
}
