import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import type { AssignPermissionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  unitId: string
  body: AssignPermissionCommand
}
export const useGrantUnitCarPermission = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: (payload) => carRegisterService.grantStaffPerm(payload?.unitId, payload?.body),
    onError: (e) => notifyError(e, 'Phân quyền quản lý xe cho đơn vị thất bại'),
    ...options
  })
