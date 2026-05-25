import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import secretaryService from '../../services/secretaryService'

export const useDeleteConfigSecretary = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (leaderId) => secretaryService.deleteConfigSecretary(leaderId),
    onError: (e) => notifyError(e, 'Xoá cấu hình thư ký thất bại'),
    ...options
  })
