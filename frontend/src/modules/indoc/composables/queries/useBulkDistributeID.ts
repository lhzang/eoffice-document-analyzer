import type { MutationOptions } from '@/shared/models/common'
import type { BatchProcessResponse, DistributeCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

type TPayload = {
  ids: string[]
  body: DistributeCommand
}

export const useBulkDistributeID = (
  options?: MutationOptions<BatchProcessResponse, TServerError, TPayload>
) =>
  useMutation<BatchProcessResponse, TServerError, TPayload>({
    mutationFn: ({ ids, body }) => inDocService.bulkDistribute(ids, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình phân phối nhiều văn bản'),
    ...options
  })
