import type { AccountDetailVM } from '@/shared/services/api'
import type { UseMutationOptions } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import staffService from '../../services/accountService'

export const useActionGetAccountDetail = (
  options?: UseMutationOptions<AccountDetailVM, TServerError, string>
) => {
  return useMutation<AccountDetailVM, TServerError, string>({
    mutationFn: (accountId: string) => staffService.getAccountDetail(accountId),
    ...options
  })
}
