import type { QueryOptions, TCommonGetListParams } from '@/shared/models/common'
import type { PaginatedResultStaffVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import accountService from '../../services/accountService'

export const useGetListAccount = (
  payload: MaybeRefOrGetter<TCommonGetListParams>,
  options?: QueryOptions<PaginatedResultStaffVM, TServerError>
) =>
  useQuery<PaginatedResultStaffVM, TServerError>({
    queryKey: ['getListAccount', payload],
    queryFn: () => accountService.getAccountList(toValue(payload)),
    ...options
  })
