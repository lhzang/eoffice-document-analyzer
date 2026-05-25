import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TBodyFinishProcessDoc } from '../../models/types'

type TPayload = {
  id: string
  body: TBodyFinishProcessDoc
}

export const useFinishDocument = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.finishDocument(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi khi kết thúc văn bản'),
    ...options
  })
