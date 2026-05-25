import type { MutationOptions } from '@/shared/models/common'
import type { CreateAccountRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accountService from '../../services/accountService'
export const useCreateAccount = (
  options?: MutationOptions<string, TServerError, CreateAccountRequest>
) =>
  useMutation<string, TServerError, CreateAccountRequest>({
    mutationFn: (payload) => accountService.createAccount(payload),
    onError: (e) => notifyError(e, 'Thêm nhân sự thất bại'),
    ...options
  })
