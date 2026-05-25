import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

import type { TProcessApproveRequesPayload } from '../../model/types'
import { esignService } from '../../services/signatureApproveService'

export const useProcessApproveRequest = (
  options?: MutationOptions<void, TServerError, TProcessApproveRequesPayload>
) =>
  useMutation<void, TServerError, TProcessApproveRequesPayload>({
    mutationFn: (payload) => esignService.processApproveRequest(payload),
    onError: (e) => {
      notifyError(e, 'Có lỗi khi xử lý yêu cầu duyệt ảnh chữ ký')
    },
    ...options
  })
