import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { CarStaffVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'

export const useGetStaffsWithGlobalViewCarPermission = (
  options?: QueryOptions<CarStaffVM[], TServerError>
) => {
  return useQuery<CarStaffVM[], TServerError>({
    queryKey: ['getStaffWithGlobalViewStaffCarPermission'],
    queryFn: () => carRegisterService.getStaffsWithGlobalViewStaffCar(),
    ...options
  })
}
