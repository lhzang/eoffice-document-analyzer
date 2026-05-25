import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import type { AssignRegisterPermissionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useGrantGlobalRegisterAndApproveCarPermission = (
  options?: MutationOptions<void, TServerError, AssignRegisterPermissionCommand>
) =>
  useMutation<void, TServerError, AssignRegisterPermissionCommand>({
    mutationFn: (payload) =>
      carRegisterService.assignGlobalRegisterAndApproveCarPermissions(payload),
    onError: (e) => notifyError(e, 'Phân quyền duyệt và đăng ký xe thất bại'),
    ...options
  })
