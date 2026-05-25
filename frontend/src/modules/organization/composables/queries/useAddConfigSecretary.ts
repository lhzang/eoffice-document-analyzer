import type { MutationOptions } from '@/shared/models/common'
import type { ConfigureSecretaryRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import secretaryService from '../../services/secretaryService'

export const useAddConfigSecretary = (
  options?: MutationOptions<void, TServerError, ConfigureSecretaryRequest>
) =>
  useMutation<void, TServerError, ConfigureSecretaryRequest>({
    mutationFn: (payload) => secretaryService.addSecretary(payload),
    onError: (e) => notifyError(e, 'Thêm cấu hình thư ký thất bại'),
    ...options
  })
