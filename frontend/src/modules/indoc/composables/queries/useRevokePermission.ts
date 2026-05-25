import type { MutationOptions } from '@/shared/models/common'
import type { ReceiverVM } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { revokePermission } from '../../services/revokePermission'

type TPayload = {
  id: string
  receivers: ReceiverVM[]
  message: string
  revokerId: string
}

export const useRevokePermission = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, receivers, message, revokerId }) =>
      revokePermission(id, { receivers, message, revokerId }),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình thu hồi quyền'),
    ...options
  })
