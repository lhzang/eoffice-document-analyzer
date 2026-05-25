import type { MutationOptions } from '@/shared/models/common'
import type { ProposeDistributeCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

type TPayload = {
  id: string
  body: ProposeDistributeCommand
}

export const useEditDistributeProposal = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.proposeIndoc(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình gửi đề xuất'),
    ...options
  })
