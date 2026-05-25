import type { MutationOptions } from '@/shared/models/common'
import type { ChangePasswordRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { passwordServices } from '../../services/passwordServices'

export const useUpdateUserPassword = (
  options?: MutationOptions<string, TServerError, ChangePasswordRequest>
) =>
  useMutation<string, TServerError, ChangePasswordRequest>({
    mutationFn: (payload) => passwordServices.changePassword(payload),
    onError: (e) => notifyError(e, 'Cập nhật mật khẩu thất bại'),
    ...options
  })
