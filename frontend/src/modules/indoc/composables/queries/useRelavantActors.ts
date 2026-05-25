import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { ReceiverVM } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useRelavantActors = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<ReceiverVM[], TServerError>
) => {
  return useQuery<ReceiverVM[], TServerError>({
    queryKey: computed(() => ['get-relavant-actors', documentId]),
    queryFn: () => inDocService.getRelevantActors(toValue(documentId)),
    ...options
  })
}
