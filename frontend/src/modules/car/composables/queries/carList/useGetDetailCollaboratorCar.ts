import type { TCarType } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions } from '@/shared/models/common'
import type { CollaboratorCarDetailVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailCollaboratorCar = <T extends TCarType>(
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<CollaboratorCarDetailVM, TServerError>
) => {
  return useQuery<CollaboratorCarDetailVM, TServerError>({
    queryKey: ['getDetailCollaboratorCar', id],
    queryFn: () => carRegisterService.getDetailCollaboratorCar(toValue(id)),
    ...options,
    structuralSharing: false
  })
}
