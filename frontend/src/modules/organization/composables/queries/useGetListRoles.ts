import type {
  QueryOptions,
  TCommonOptionalGetListParams,
  TResponseListData
} from '@/shared/models/common'
import type { RoleVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import accessControlService from '../../services/accessControlService'

export const useGetListRoles = (
  payload: MaybeRefOrGetter<TCommonOptionalGetListParams>,
  options?: QueryOptions<TResponseListData<RoleVM>, TServerError>
) => {
  return useQuery<TResponseListData<RoleVM>, TServerError>({
    queryKey: ['getListRoles', payload],
    queryFn: () => accessControlService.getListRoles(toValue(payload)),
    ...options
  })
}
