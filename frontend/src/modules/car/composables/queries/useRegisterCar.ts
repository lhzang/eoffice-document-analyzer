import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TCarRegisterPayload, TCarRegisterType } from '../../models/carRegister'
import { carRegisterService } from '../../services/carService'

export const useRegisterCar = (
  options?: MutationOptions<void | string, TServerError, TCarRegisterPayload<TCarRegisterType>>
) =>
  useMutation<void | string, TServerError, TCarRegisterPayload<TCarRegisterType>>({
    mutationFn: (params) => carRegisterService.register(params),
    onError: (e) => notifyError(e, 'Tạo đăng ký xe thất bại'),
    ...options
  })
