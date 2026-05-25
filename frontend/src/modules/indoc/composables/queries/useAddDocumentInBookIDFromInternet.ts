import { useMutation, type MutationOptions } from '@tanstack/vue-query'

import { notifyError } from '@/shared/utils/common'

import inDocService from '../../inDocService'
import type { TAddDocumentInBookIDFromInternetPayLoad } from '../../models/types'

export const useAddDocumentInBookIDFromInternet = (
  options?: MutationOptions<void, TServerError, TAddDocumentInBookIDFromInternetPayLoad>
) =>
  useMutation({
    mutationFn: ({ type, ...body }: TAddDocumentInBookIDFromInternetPayLoad) => {
      console.log('🚀 ~ type:', type)
      if (type === 'eDoc') return inDocService.addEdocToBook(body)
      return inDocService.addInDocToBook(body)
    },
    onError: (e) => notifyError(e, 'Tạo văn bản đến thất bại'),
    ...options
  })
