import type { MutationOptions } from '@/shared/models/common'
import type { UpdateDocumentBookCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import documentBookService from '../../../services/documentBookService'

type TPayload = {
  id: string
  bookData?: UpdateDocumentBookCommand
  startCount?: number
}

export const useEditDocumentBook = (options?: MutationOptions<void[], TServerError, TPayload>) =>
  useMutation<void[], TServerError, TPayload>({
    mutationFn: ({ id, bookData, startCount }) =>
      documentBookService.updateBook(id, bookData, startCount),
    onError: (e) => notifyError(e, 'Cập nhật sổ văn bản thất bại'),
    ...options
  })
