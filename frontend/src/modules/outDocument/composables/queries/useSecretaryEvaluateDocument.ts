import type { MutationOptions } from '@/shared/models/common'
import type { EvaluateDocumentCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPayload = {
  id: string
  body: EvaluateDocumentCommand
}

export const useSecretaryEvaluateDocument = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => outDocServices.secretaryEvaluateDocument(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi khi duyệt văn bản'),
    ...options
  })
