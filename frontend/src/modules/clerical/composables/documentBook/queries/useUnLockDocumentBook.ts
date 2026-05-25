import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import documentBookService from '../../../services/documentBookService'

export const useUnLockDocumentBook = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id: string) => documentBookService.unLockBook(id),
    onError: (e) => notifyError(e, 'Mở khoá sổ văn bản thất bại'),
    ...options
  })
