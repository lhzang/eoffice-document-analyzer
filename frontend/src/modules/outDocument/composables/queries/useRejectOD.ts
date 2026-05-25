import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPayload = {
  id: string
  body: {
    reason: string
    files: Array<File>
  }
}

export const useRejectOD = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => outDocServices.rejectDocument(id, body.reason, body.files),
    onError: (e) => notifyError(e, 'Đã có lỗi khi trả lại văn bản'),
    ...options
  })
