import type { MutationOptions } from '@/shared/models/common'
import type { UpdateRoleRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accessControlService from '../../services/accessControlService'
type TUpdatePayload = {
  id: string
  payload: UpdateRoleRequest
}
export const useUpdateRole = (options?: MutationOptions<void, TServerError, TUpdatePayload>) =>
  useMutation<void, TServerError, TUpdatePayload>({
    mutationFn: ({ id, payload }) => accessControlService.updateRole(id, payload),
    onError: (e) => notifyError(e, 'Cập nhật vai trò thất bại'),
    ...options
  })
