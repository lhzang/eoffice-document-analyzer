import type { MutationOptions } from '@/shared/models/common'
import type { DocumentIdResponse } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TCreateIncomingPaperFormData } from '../../models/inDocTypes'

export const useAddPaperID = (
  options?: MutationOptions<DocumentIdResponse, TServerError, TCreateIncomingPaperFormData>
) =>
  useMutation<DocumentIdResponse, TServerError, TCreateIncomingPaperFormData>({
    mutationFn: (payload: TCreateIncomingPaperFormData) => inDocService.addPaperIDToBook(payload),
    onError: (e) => notifyError(e, 'Nhập văn bản đến giấy thất bại'),
    ...options
  })
