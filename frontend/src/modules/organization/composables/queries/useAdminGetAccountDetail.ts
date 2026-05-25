import type { QueryOptions } from '@/shared/models/common'
import type { AccountDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { toValue, type MaybeRefOrGetter } from 'vue'
import staffService from '../../services/accountService'

export const useAdminGetAccountDetail = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<AccountDetailVM, AxiosError>
) => {
  return useQuery<AccountDetailVM, AxiosError>({
    queryKey: ['getStaffById', id],
    queryFn: () => staffService.getAccountDetail(toValue(id)),
    ...options
  })
}
