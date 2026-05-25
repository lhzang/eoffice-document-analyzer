import type { QueryOptions } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { outDocServices } from '../../services/document'

export const useGetAvailableActions = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<string[], TServerError>
) => {
  return useQuery<string[], TServerError>({
    queryKey: ['getAvailableActions', id],
    queryFn: () => outDocServices.getAvailableActions(toValue(id)),
    ...options
  })
}
