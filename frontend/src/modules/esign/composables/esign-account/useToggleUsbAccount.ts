import { notifyError } from '@/shared/utils/common'
import { useMutation, type MutationOptions } from '@tanstack/vue-query'
import type { ToggleUsbAccountRequest } from '../../model/esignAccount'
import { esignAccountService } from '../../services/esignAccountService'

export const useToggleUsbAccount = (
  options?: MutationOptions<string, TServerError, ToggleUsbAccountRequest>
) =>
  useMutation({
    mutationFn: (payload: ToggleUsbAccountRequest) => esignAccountService.toggleUsbAccount(payload),
    onError: (e) => notifyError(e, 'Thay đổi trạng thái thất bại'),
    ...options
  })
