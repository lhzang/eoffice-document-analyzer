import type { MutationOptions } from '@/shared/models/common'
import type { CreateRoleCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accessControlService from '../../services/accessControlService'

export const useCreateRole = (options?: MutationOptions<void, TServerError, CreateRoleCommand>) =>
  useMutation<void, TServerError, CreateRoleCommand>({
    mutationFn: (payload) => accessControlService.createRole(payload),
    onError: (e) => notifyError(e, 'Tạo mới vai trò thất bại'),
    ...options
  })
