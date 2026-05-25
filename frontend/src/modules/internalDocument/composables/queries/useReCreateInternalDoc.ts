import type { MutationOptions, TServerError } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TReRegisterInternalDoc } from '../../models/document'
import { internalDocServices } from '../../services/document'

export const useReCreateInternalDoc = (
  options?: MutationOptions<void, TServerError, TReRegisterInternalDoc>
) =>
  useMutation<void, TServerError, TReRegisterInternalDoc>({
    mutationFn: (payload) => internalDocServices.reRegisterInternalDoc(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi khi trình lại văn bản'),
    ...options
  })
