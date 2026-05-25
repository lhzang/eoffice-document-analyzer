import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TIssuePaperDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useIssuePaperOutDoc = (
  options?: MutationOptions<void, TServerError, TIssuePaperDocPayload>
) =>
  useMutation<void, TServerError, TIssuePaperDocPayload>({
    mutationFn: (payload) => outDocServices.issuePaperDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi cấp số văn bản'),
    ...options
  })
