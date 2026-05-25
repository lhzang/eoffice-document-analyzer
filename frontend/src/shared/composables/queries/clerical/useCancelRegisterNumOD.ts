import type { MutationOptions } from '@/shared/models/common'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  bookId: string
  number: number
}
export const useCancelRegisterNumOD = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ bookId, number }) =>
      sharedDocumentBookService.cancelRegistration(bookId, number),
    onError: (e) => notifyError(e, 'Xoá đăng ký giữ số thất bại'),
    ...options
  })
