import type { QueryOptions } from '@/shared/models/common'
import type { PermissionVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import accessControlService from '../../services/accessControlService'

export const useGetAllPermissionList = (
  // payload: MaybeRefOrGetter<TCommonOptionalGetListParams>,
  options?: QueryOptions<PermissionVM[], TServerError>
) => {
  return useQuery<PermissionVM[], TServerError>({
    queryKey: ['getAllPermissions'],
    queryFn: () => accessControlService.getListPermission({ page: 0, size: 2000 }),
    ...options
  })
}
