import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TBodyReturnAssignedTask } from '../../models/types'

type TPayload = {
  id: string
  body: TBodyReturnAssignedTask
}

export const useReturnAsignedTask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.returnAsignedTask(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi khi trả lại văn bản'),
    ...options
  })
