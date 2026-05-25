import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TIssueEDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useImplementDestination = (
  options?: MutationOptions<void, TServerError, TIssueEDocPayload>
) =>
  useMutation<void, TServerError, TIssueEDocPayload>({
    mutationFn: (payload) => outDocServices.issueEDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi cấp số văn bản'),
    ...options
  })
