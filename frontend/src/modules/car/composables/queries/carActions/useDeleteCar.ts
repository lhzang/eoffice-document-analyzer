import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useDeleteCar = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => carRegisterService.deleteCar(id),
    onError: (e) => notifyError(e, 'Xoá đăng ký xe thất bại'),
    ...options
  })
