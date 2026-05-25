import accountService from '@/modules/organization/services/accountService'
import type { MutationOptions } from '@/shared/models/common'
import type { UpdateAccountRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export type TUpdateAccountPayload = {
  id: string
  payload: UpdateAccountRequest
}
export const useUpdateAccountInfo = (
  options?: MutationOptions<void, TServerError, TUpdateAccountPayload>
) =>
  useMutation<void, TServerError, TUpdateAccountPayload>({
    mutationFn: ({ id, payload }) => accountService.updateAccountInfo(id, payload),
    onError: (e) => notifyError(e, 'Cập nhật người dùng thất bại'),
    ...options
  })
