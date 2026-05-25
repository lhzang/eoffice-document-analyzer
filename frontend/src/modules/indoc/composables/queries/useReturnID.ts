import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TBodyReturnID } from '../../models/types'

type TPayload = {
  id: string
  body: TBodyReturnID
}

export const useReturnID = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.returnID(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi khi trả lại văn bản'),
    ...options
  })
