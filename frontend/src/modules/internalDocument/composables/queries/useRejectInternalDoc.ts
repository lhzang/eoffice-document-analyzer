import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { internalDocServices } from '../../services/document'

type TPayload = {
  id: string
  body: {
    reason: string
    files: Array<File>
  }
}

export const useRejectInternalDoc = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => internalDocServices.rejectDocument(id, body.reason, body.files),
    onError: (e) => notifyError(e, 'Đã có lỗi khi trả lại văn bản'),
    ...options
  })
