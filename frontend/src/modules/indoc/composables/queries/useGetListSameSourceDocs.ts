import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { SameOriginItem } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useGetListSameSourceDocs = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<SameOriginItem[], TServerError>
) => {
  return useQuery<SameOriginItem[], TServerError>({
    queryKey: computed(() => ['get-list-same-source-docs', documentId]),
    queryFn: () => inDocService.getSameSourceDocs(toValue(documentId)),
    ...options
  })
}
