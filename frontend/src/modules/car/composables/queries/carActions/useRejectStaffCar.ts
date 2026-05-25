import type { TRejectCarPayload } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useRejectStaffCar = (
  options?: MutationOptions<void, TServerError, TRejectCarPayload>
) =>
  useMutation<void, TServerError, TRejectCarPayload>({
    mutationFn: ({ id, reason }) => carRegisterService.rejectStaffCar(id, reason),
    onError: (e) => notifyError(e, 'Từ chối đăng ký xe cán bộ thất bại'),
    ...options
  })
