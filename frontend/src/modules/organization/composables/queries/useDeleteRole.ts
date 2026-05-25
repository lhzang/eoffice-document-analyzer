import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accessControlService from '../../services/accessControlService'

export const useDeleteRole = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => accessControlService.deleteRole(id),
    onError: (e) => notifyError(e, 'Xóa vai trò thất bại'),
    ...options
  })
