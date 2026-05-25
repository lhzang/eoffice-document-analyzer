import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TUpdateDocumentPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useUpdateOutDoc = (
  options?: MutationOptions<void, TServerError, TUpdateDocumentPayload>
) =>
  useMutation<void, TServerError, TUpdateDocumentPayload>({
    mutationKey: ['updateOutDoc'],
    mutationFn: (payload) => outDocServices.updateDocument(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi cập nhật văn bản'),
    ...options
  })
