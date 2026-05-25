import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TPayload = {
  staffId: string
  carType: TCarType
}

export const useRevokeGlobalViewCarPermission = (
  options?: MutationOptions<void, TServerError, TPayload>
) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ staffId, carType }) =>
      carRegisterService.revokeGlobalViewCarPermissions(staffId, carType),
    onError: (e) => notifyError(e, 'Thu hồi quyền xem xe toàn tổ chức thất bại'),
    ...options
  })
