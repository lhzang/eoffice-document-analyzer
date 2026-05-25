import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TRegisterPaperOutDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useCreatePaperOutDoc = (
  options?: MutationOptions<string, TServerError, TRegisterPaperOutDocPayload>
) =>
  useMutation<string, TServerError, TRegisterPaperOutDocPayload>({
    mutationFn: (payload) => outDocServices.registerPaperOutDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi đăng ký văn bản'),
    ...options
  })
