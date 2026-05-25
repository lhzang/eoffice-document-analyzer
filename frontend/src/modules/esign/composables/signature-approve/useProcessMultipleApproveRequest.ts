import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

import type { TProcessMultipleSignatures } from '../../model/types'
import { esignService } from '../../services/signatureApproveService'

export const useProcessMultipleApproveRequest = (
  options?: MutationOptions<void, TServerError, TProcessMultipleSignatures>
) =>
  useMutation<void, TServerError, TProcessMultipleSignatures>({
    mutationFn: (payload) => esignService.processMultipleSignatures(payload),
    onError: (e) => {
      notifyError(e, 'Có lỗi khi duyệt danh sách chữ ký')
    },
    ...options
  })
