import type { QueryOptions } from '@/shared/models/common'
import type { TGetStaffInUnitPayload } from '@/shared/models/organization/unit'
import type { PaginatedResultStaffVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetAllUsersInUnit = (
  payload: MaybeRefOrGetter<TGetStaffInUnitPayload>,
  options?: QueryOptions<PaginatedResultStaffVM, TServerError>
) => {
  return useQuery<PaginatedResultStaffVM, TServerError>({
    queryKey: ['getUsersInUnit', payload],
    queryFn: async () => await sharedUnitService.getUserInUnit(toValue(payload)),
    ...options
  })
}
