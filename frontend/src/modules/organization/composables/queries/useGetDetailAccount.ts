import type { QueryOptions } from '@/shared/models/common'
import type { AccountDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import accountService from '../../services/accountService'

export const useGetDetailAccount = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<AccountDetailVM, TServerError>
) =>
  useQuery<AccountDetailVM, TServerError>({
    queryKey: ['getDetailAccount', id],
    queryFn: () => accountService.getAccountDetail(toValue(id)),
    ...options
  })
