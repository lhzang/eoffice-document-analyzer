import { esignAccountService } from '@/modules/esign/services/esignAccountService'
import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'

type TPayload = { simType: string; accountId: string }

export const useDeleteEsignAccount = (options?: MutationOptions<void, TServerError, TPayload>) => {
  return useMutation<void, TServerError, TPayload>({
    mutationFn: ({ simType, accountId }) => {
      return esignAccountService.deleteEsignAccount(simType, accountId)
    },
    onError: (e) => notifyError(e, 'Xóa tài khoản chữ ký số thất bại'),
    ...options
  })
}
