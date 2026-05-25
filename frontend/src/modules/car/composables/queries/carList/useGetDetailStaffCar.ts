import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { StaffCarDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailStaffCar = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<StaffCarDetailVM, TServerError>
) => {
  return useQuery<StaffCarDetailVM, TServerError>({
    queryKey: ['getDetailStaffCar', id],
    queryFn: () => carRegisterService.getDetailStaffCar(toValue(id)),
    ...options
  })
}
