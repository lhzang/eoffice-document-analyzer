import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import type { AssignDeletePermissionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useGrantGlobalDeleteCarPermission = (
  options?: MutationOptions<void, TServerError, AssignDeletePermissionCommand>
) =>
  useMutation<void, TServerError, AssignDeletePermissionCommand>({
    mutationFn: (payload) => carRegisterService.assignGlobalDeleteCarPermissions(payload),
    onError: (e) => notifyError(e, 'Phân quyền xoá xe toàn tổ chức thất bại'),
    ...options
  })
