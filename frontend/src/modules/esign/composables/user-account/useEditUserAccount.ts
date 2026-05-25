import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import type { EditUserAccountRequest } from '../../model/userAccount'
import { userAccountService } from '../../services/userAccountService'

export const useEditUserAccount = (
  options?: MutationOptions<string, TServerError, { body: EditUserAccountRequest }>
) =>
  useMutation({
    mutationFn: ({ email, body }: { email: string; body: EditUserAccountRequest }) =>
      userAccountService.editUserAccount(email, body),
    ...options
  })
