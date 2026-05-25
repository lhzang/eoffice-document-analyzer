import type { MutationOptions } from '@/shared/models/common'
import type { PreviewWhenIssuedQuery } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { outDocServices } from '../../services/document'

type TPreviewWhenIssuePayload = {
  body: PreviewWhenIssuedQuery
  fileName: string
}

export const usePreviewIssueDoc = (
  options?: MutationOptions<File, TServerError, TPreviewWhenIssuePayload>
) =>
  useMutation<File, TServerError, TPreviewWhenIssuePayload>({
    mutationFn: (payload) => outDocServices.previewIssueDoc(payload?.body, payload?.fileName),
    onError: (e) => notifyError(e, 'Có lỗi khi xem trước văn bản'),
    ...options
  })
