import type { MutationOptions } from '@/shared/models/common'
import type { RevokeDocumentCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

type TPayload = {
  id: string
  body: RevokeDocumentCommand
}

export const useRevokeCreatedDoc = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.revokeIndoc(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình thu hồi văn bản'),
    ...options
  })
