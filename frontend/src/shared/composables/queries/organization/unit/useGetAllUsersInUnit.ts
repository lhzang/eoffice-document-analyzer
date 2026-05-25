import type { QueryOptions } from '@/shared/models/common'
import type { StaffVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetAllUsersInUnit = (
  unitId: MaybeRefOrGetter<string>,
  options?: QueryOptions<Array<StaffVM>, TServerError>
) => {
  return useQuery<Array<StaffVM>, TServerError>({
    queryKey: ['getUsersInUnitNoPaginate', unitId],
    queryFn: async () => await sharedUnitService.getUsersInUnitNoPaginate(toValue(unitId)),
    ...options
  })
}
