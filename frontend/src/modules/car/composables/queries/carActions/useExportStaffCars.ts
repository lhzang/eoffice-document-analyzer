import { carRegisterService } from '@/modules/car/services/carService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useExportStaffCars = (options?: MutationOptions<Blob, TServerError, void>) =>
  useMutation<Blob, TServerError, void>({
    mutationFn: () => carRegisterService.exportStaffCarData(),
    onError: (e) => notifyError(e, 'Xuất excel danh sách xe cán bộ thất bại'),
    ...options
  })
