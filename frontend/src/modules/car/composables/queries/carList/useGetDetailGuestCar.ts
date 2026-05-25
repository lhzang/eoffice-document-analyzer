import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { GuestCarDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailGuestCar = <T extends TCarType>(
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<GuestCarDetailVM, TServerError>
) => {
  return useQuery<GuestCarDetailVM, TServerError>({
    queryKey: ['getDetailGuestCar', id],
    queryFn: () => carRegisterService.getDetailGuestCar(toValue(id)),
    ...options,
    structuralSharing: false
  })
}
