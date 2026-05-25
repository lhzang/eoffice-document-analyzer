import type { TCarType, TDetailCarPayload, TDetailCarResponse } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailCar = <T extends TCarType>(
  getDetailPayload: MaybeRefOrGetter<TDetailCarPayload<T>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: QueryOptions<TDetailCarResponse[T], TServerError, TDetailCarResponse[T], any>
) => {
  return useQuery<TDetailCarResponse[T], TServerError>({
    queryKey: ['getDetailCar', getDetailPayload],
    queryFn: () => carRegisterService.getDetailCar(toValue(getDetailPayload)),
    ...options,
    structuralSharing: false
  })
}
