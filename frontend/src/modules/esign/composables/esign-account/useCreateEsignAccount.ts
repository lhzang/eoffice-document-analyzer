import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import type { CreateEsignAccountRequest } from '../../model/esignAccount'
import { esignAccountService } from '../../services/esignAccountService'

export const useCreateEsignAccount = (
  options?: MutationOptions<void, TServerError, CreateEsignAccountRequest>
) =>
  useMutation<void, TServerError, CreateEsignAccountRequest>({
    mutationFn: async (payload: CreateEsignAccountRequest) => {
      await esignAccountService.createEsignAccount(payload)
    },
    onError: (e) => notifyError(e, 'Tạo tài khoản chữ ký số thất bại'),
    ...options
  })
