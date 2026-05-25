import documentBookService from '@/modules/clerical/services/documentBookService'
import type { MutationOptions } from '@/shared/models/common'
import type { CreateDocumentBookCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useAddDocumentBook = (
  options?: MutationOptions<void, TServerError, CreateDocumentBookCommand>
) =>
  useMutation<void, TServerError, CreateDocumentBookCommand>({
    mutationFn: (payload: CreateDocumentBookCommand) => documentBookService.createBook(payload),
    onError: (e) => notifyError(e, 'Thêm mới sổ văn bản thất bại'),
    ...options
  })
