import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { internalDocServices } from '../../services/document'

export const useDeleteRejectedDoc = (
  options?: MutationOptions<void, TServerError, string>
) =>
  useMutation<void, TServerError, string>({
    mutationKey: ['deleteRejectedDoc'],
    mutationFn: (id) => internalDocServices.deleteRejectedDoc(id),
    onError: (e) => notifyError(e, 'Đã có lỗi xoá văn bản bị trả lại'),
    ...options
  })
