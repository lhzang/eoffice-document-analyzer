import type { QueryOptions, TCommonGetListParams } from '@/shared/models/common'
import type { PaginatedResultStaffVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import accountService from '../../services/accountService'

export const useGetListAllAccounts = (
  payload: MaybeRefOrGetter<TCommonGetListParams>,
  options?: QueryOptions<PaginatedResultStaffVM, TServerError>
) =>
  useQuery<PaginatedResultStaffVM, TServerError>({
    queryKey: ['getListAllAccounts', payload],
    queryFn: () => accountService.getAccountList(toValue(payload)),
    ...options
  })
