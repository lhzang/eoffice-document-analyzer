import type { MutationOptions } from '@/shared/models/common'
import type { DestinationDto } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { internalDocDestinationService } from '../../services/destination'

type TPayload = {
  docId: string
  destinations: DestinationDto[]
}

export const useAddDestinations = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: (payload) =>
      internalDocDestinationService.addDestinations(payload?.docId, payload?.destinations),
    onError: (e) => notifyError(e, 'Đã có lỗi khi bổ sung nơi nhận'),
    ...options
  })
