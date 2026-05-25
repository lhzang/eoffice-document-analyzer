import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TAddInDocToBook } from '../../models/inDocTypes'

export const useAddInternalIDIntoBook = (
  options?: MutationOptions<
    void,
    TServerError,
    {
      id: string
      body: TAddInDocToBook
    }
  >
) =>
  useMutation({
    mutationFn: ({ id, body }) => inDocService.addInternalIDIntoBook(id, body),
    onError: (e) => notifyError(e, 'Tiếp nhận văn bản đến thất bại'),
    ...options
  })
