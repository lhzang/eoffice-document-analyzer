import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import type { AssignViewPermissionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useGrantGlobalViewCarPermission = (
  options?: MutationOptions<void, TServerError, AssignViewPermissionCommand>
) =>
  useMutation<void, TServerError, AssignViewPermissionCommand>({
    mutationFn: (payload) => carRegisterService.assignGlobalViewCarPermissions(payload),
    onError: (e) => notifyError(e, 'Phân quyền xem xe toàn tổ chức thất bại'),
    ...options
  })
