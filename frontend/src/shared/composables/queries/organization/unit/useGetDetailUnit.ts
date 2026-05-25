import type { QueryOptions } from '@/shared/models/common'
import type { UnitInfoVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailUnit = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<UnitInfoVM, TServerError>
) =>
  useQuery<UnitInfoVM, TServerError>({
    queryKey: ['getDetailUnit', id],
    queryFn: () => sharedUnitService.getUnitInfo(toValue(id)),
    ...options
  })
