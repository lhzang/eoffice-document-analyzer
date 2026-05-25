import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { UniversityCarDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailUniCar = <T extends TCarType>(
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<UniversityCarDetailVM, TServerError>
) => {
  return useQuery<UniversityCarDetailVM, TServerError>({
    queryKey: ['getDetailUniCar', id],
    queryFn: () => carRegisterService.getDetailUniCar(toValue(id)),
    ...options,
    structuralSharing: false
  })
}
