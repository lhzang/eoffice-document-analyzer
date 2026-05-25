import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TSendToDestinationPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useSendToDestinations = (
  options?: MutationOptions<void, TServerError, TSendToDestinationPayload>
) =>
  useMutation<void, TServerError, TSendToDestinationPayload>({
    mutationFn: (payload) => outDocServices.sendToDestinations(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi gửi văn bản'),
    ...options
  })
