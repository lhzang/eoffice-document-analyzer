import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TUpdateETagPayload = {
  id: string
  eTag: string
}

export const useUpdateETag = (options?: MutationOptions<void, TServerError, TUpdateETagPayload>) =>
  useMutation<void, TServerError, TUpdateETagPayload>({
    mutationFn: ({ id, eTag }) => carRegisterService.updateStaffCar(id, eTag),
    onError: (e) => notifyError(e, 'Cập nhật xe thất bại'),
    ...options
  })
