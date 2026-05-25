import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  staffId: string
  carType: TCarType
}
export const useRevokeGlobalDeleteCarPermission = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ staffId, carType }) =>
      carRegisterService.revokeGlobalDeleteCarPermissions(staffId, carType),
    onError: (e) => notifyError(e, 'Thu hồi quyền xoá xe toàn tổ chức thất bại'),
    ...options
  })
