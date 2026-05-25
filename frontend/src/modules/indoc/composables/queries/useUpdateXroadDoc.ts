import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import { type TUpdateXroadPayload } from '../../models/types'

export const useUpdateXroadDoc = (
  options?: MutationOptions<void, TServerError, TUpdateXroadPayload>
) =>
  useMutation<void, TServerError, TUpdateXroadPayload>({
    mutationFn: (payload) => inDocService.updateXroadDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi cập nhật văn bản'),
    ...options
  })
