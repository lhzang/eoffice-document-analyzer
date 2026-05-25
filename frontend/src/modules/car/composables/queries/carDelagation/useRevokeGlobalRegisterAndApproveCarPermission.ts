import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  unitId: string
  staffId: string
  carType: TCarType
}
export const useRevokeGlobalRegisterAndApproveCarPermission = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ unitId, staffId, carType }) =>
      carRegisterService.revokeGlobalRegisterAndApproveCarPermissions(unitId, staffId, carType),
    onError: (e) => notifyError(e, 'Thu hồi quyền duyệt và đăng ký xe thất bại'),
    ...options
  })
