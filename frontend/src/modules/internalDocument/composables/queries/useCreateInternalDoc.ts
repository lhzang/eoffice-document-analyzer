import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TRegisterInternalDoc } from '../../models/document'
import { internalDocServices } from '../../services/document'

export const useCreateInternalDoc = (
  options?: MutationOptions<string, TServerError, TRegisterInternalDoc>
) =>
  useMutation<string, TServerError, TRegisterInternalDoc>({
    mutationFn: (payload) => internalDocServices.registerInternalDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi đăng ký văn bản'),
    ...options
  })
