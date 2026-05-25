import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useApproveStaffCar = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => carRegisterService.approveStaffCar(id),
    onError: (e) => notifyError(e, 'Duyệt đăng ký xe cán bộ thất bại'),
    ...options
  })
