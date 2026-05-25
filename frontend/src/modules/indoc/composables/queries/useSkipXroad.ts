import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

type TPayload = {
  id: string
  reason?: string
}

export const useSkipXroad = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, reason }) => inDocService.skipXroad(id, reason),
    onError: (e) => notifyError(e, 'Đã có lỗi khi bỏ qua văn bản'),
    ...options
  })
