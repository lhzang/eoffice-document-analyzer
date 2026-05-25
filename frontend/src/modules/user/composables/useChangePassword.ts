import type { ChangePasswordRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import { accountService } from '../services/accountService'

export const useChangePassword = (
  options?: MutationOptions<void, TServerError, ChangePasswordRequest>
) =>
  useMutation({
    mutationFn: (payload) => accountService.changePassword(payload),
    onError: (e) => notifyError(e, 'Thay đổi mật khẩu thất bại'),
    ...options
  })
