import type { MutationOptions } from '@/shared/models/common'
import type { CommentCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

type TPayload = {
  id: string
  body: CommentCommand
}

export const useCommentInDoc = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.commentInDoc(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình gửi ý kiến'),
    ...options
  })
