import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import documentBookService from '../../../services/documentBookService'

type TPayload = {
  id: string
  startNumber: number
}

export const useUpdateStartCount = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, startNumber }) => documentBookService.editStartNumber(id, startNumber),
    onError: (e) => notifyError(e, 'Sửa số bắt đầu của sổ văn bản thất bại'),
    ...options
  })
