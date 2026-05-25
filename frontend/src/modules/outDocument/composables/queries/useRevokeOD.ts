import type { MutationOptions } from '@/shared/models/common'
import type { CreatorRevokeDocumentCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPayload = {
  id: string
  body: CreatorRevokeDocumentCommand
}

export const useRevokeOD = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => outDocServices.revokeDocument(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi khi thu hồi văn bản'),
    ...options
  })
