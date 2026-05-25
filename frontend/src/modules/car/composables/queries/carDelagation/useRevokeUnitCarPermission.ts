import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  staffId: string
  carType: TCarType
  unitId: string
}
export const useRevokeUnitCarPermission = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ staffId, carType, unitId }) =>
      carRegisterService.revokeStaffPerm(staffId, carType, unitId),
    onError: (e) => notifyError(e, 'Thu hồi quyền quản lý xe cho đơn vị thất bại'),
    ...options
  })
