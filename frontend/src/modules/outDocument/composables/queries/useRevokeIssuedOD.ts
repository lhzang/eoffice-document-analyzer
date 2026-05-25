import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPayload = {
  id: string
  file: File
  reason?: string
}

export const useRevokeIssuedOD = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, file, reason }) => outDocServices.revokedIssuedDocument(id, file, reason),
    onError: (e) => notifyError(e, 'Đã có lỗi khi thu hồi văn bản'),
    ...options
  })
