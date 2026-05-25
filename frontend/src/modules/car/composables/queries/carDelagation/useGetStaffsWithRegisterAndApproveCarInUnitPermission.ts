import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { CarStaffVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetStaffsWithRegisterAndApproveCarInUnitPermission = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<CarStaffVM[], TServerError>
) => {
  return useQuery<CarStaffVM[], TServerError>({
    queryKey: ['getStaffWithsWithRegisterAndApproveCarInUnitPermission', unitId],
    queryFn: () => carRegisterService.getStaffsWithRegisterAndApproveCarInUnit(toValue(unitId)),
    ...options
  })
}
