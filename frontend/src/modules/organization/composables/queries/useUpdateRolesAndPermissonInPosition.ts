import type { MutationOptions } from '@/shared/models/common'
import type { UpdateSubjectRequest } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import accessControlService from '../../services/accessControlService'
export type TUpdateRoleAndPermissionInRolePayload = {
  positionId: string
  payload: UpdateSubjectRequest
}
export const useUpdateRolesAndPermissonInPosition = (
  options?: MutationOptions<void, TServerError, TUpdateRoleAndPermissionInRolePayload>
) =>
  useMutation<void, TServerError, TUpdateRoleAndPermissionInRolePayload>({
    mutationFn: ({ positionId, payload }) =>
      accessControlService.updateRoleAndPermissionOfPosition(positionId, payload),
    onError: (e) => notifyError(e, 'Cập nhật vai trò trong chức vụ của người dùng thất bại'),
    ...options
  })
