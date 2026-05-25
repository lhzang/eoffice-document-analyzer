import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TRegisterEOutDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useCreateEOutDoc = (
  options?: MutationOptions<string, TServerError, TRegisterEOutDocPayload>
) =>
  useMutation<string, TServerError, TRegisterEOutDocPayload>({
    mutationFn: (payload) => outDocServices.registerEOutDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi đăng ký văn bản'),
    ...options
  })
