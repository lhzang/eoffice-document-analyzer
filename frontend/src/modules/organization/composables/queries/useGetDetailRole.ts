import type { QueryOptions } from '@/shared/models/common'
import type { RoleVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import accessControlService from '../../services/accessControlService'

export const useGetDetailRole = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<RoleVM, TServerError>
) => {
  return useQuery<RoleVM, TServerError>({
    queryKey: ['getDetailRole', id],
    queryFn: () => accessControlService.getDetailRole(toValue(id)),
    ...options
  })
}
