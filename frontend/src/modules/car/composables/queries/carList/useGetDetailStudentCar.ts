import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { StudentCarDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailStudentCar = <T extends TCarType>(
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<StudentCarDetailVM, TServerError>
) => {
  return useQuery<StudentCarDetailVM, TServerError>({
    queryKey: ['getDetailStudentCar', id],
    queryFn: () => carRegisterService.getDetailStudentCar(toValue(id)),
    ...options,
    structuralSharing: false
  })
}
