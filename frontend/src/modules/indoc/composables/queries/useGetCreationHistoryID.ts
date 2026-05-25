import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { CreatedHistoryEventVM } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useGetCreationHistoryID = (
  documentId: MaybeRefOrGetter<string | null>,
  options?: QueryOptions<CreatedHistoryEventVM[], TServerError>
) => {
  return useQuery<CreatedHistoryEventVM[], TServerError>({
    queryKey: computed(() => ['get-creation-history', documentId]),
    queryFn: () => inDocService.getCreateHistoryIndoc(toValue(documentId)!),
    ...options
  })
}
