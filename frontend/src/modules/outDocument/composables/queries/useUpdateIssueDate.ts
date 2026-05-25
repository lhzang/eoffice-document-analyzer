import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TUpdateIssueDatePayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useUpdateIssueDate = (
  options?: MutationOptions<void, TServerError, TUpdateIssueDatePayload>
) =>
  useMutation<void, TServerError, TUpdateIssueDatePayload>({
    mutationKey: ['updateIssueDate'],
    mutationFn: (payload) => outDocServices.updateIssueDate(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi cập nhật ngày ban hành của văn bản'),
    ...options
  })
