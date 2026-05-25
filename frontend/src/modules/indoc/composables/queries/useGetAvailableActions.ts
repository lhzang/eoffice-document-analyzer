import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { BaseAction } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useGetAvailableActions = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<Array<BaseAction>, TServerError>
) => {
  return useQuery<Array<BaseAction>, TServerError>({
    queryKey: ['get-available-actions', documentId],
    queryFn: () => inDocService.getAvailableActions(toValue(documentId)),
    ...options
  })
}
