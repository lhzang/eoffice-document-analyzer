import type { MutationOptions } from '@/shared/models/common'
import type { BatchProcessResponse } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

export const useCompleteManyInDoc = (
  options?: MutationOptions<BatchProcessResponse, TServerError, string[]>
) =>
  useMutation<BatchProcessResponse, TServerError, string[]>({
    mutationFn: (docIds) => inDocService.completeManyInDoc(docIds),
    onError: (e) => notifyError(e, 'Đã có lỗi khi hoàn thành nhiều văn bản'),
    ...options
  })
