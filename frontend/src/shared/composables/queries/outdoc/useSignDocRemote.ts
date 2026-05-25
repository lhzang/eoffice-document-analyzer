import type { MutationOptions } from '@/shared/models/common'
import type { TSignRemotePayload } from '@/shared/models/sign'
import { signDocServices } from '@/shared/services/outdoc/signDocServices'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useSignDocRemote = (
  options?: MutationOptions<void, TServerError, TSignRemotePayload>
) =>
  useMutation<void, TServerError, TSignRemotePayload>({
    mutationFn: (payload) => signDocServices.signRemote(payload),
    onError: (e) => notifyError(e, 'Có lỗi xảy ra khi ký'),
    ...options
  })
