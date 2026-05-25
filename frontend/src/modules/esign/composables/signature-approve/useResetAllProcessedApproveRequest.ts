import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

import { esignService } from '../../services/signatureApproveService'

export const useResetAllProcessedApproveRequest = (
  options?: MutationOptions<void, TServerError, void>
) =>
  useMutation<void, TServerError, void>({
    mutationFn: () => esignService.resetAllProcessedSignature(),
    onError: (e) => {
      notifyError(e, 'Có lỗi khi reset danh sách chữ ký')
    },
    ...options
  })
