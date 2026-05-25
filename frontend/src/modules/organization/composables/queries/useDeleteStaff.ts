import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accountService from '../../services/accountService'

export const useDeleteStaff = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => accountService.deleteAccount(id),
    onError: (e) => notifyError(e, 'Xóa nhân sự thất bại'),
    ...options
  })
