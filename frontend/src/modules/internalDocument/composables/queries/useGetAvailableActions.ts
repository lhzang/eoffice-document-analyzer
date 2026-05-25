import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { BaseAction } from '@/shared/services/api'
import { internalDocServices } from '../../services/document'

export const useGetAvailableActions = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<Array<BaseAction>, TServerError>
) => {
  return useQuery<Array<BaseAction>, TServerError>({
    queryKey: ['get-available-actions-internal', documentId],
    queryFn: () => internalDocServices.getAvailableActions(toValue(documentId)),
    ...options
  })
}
