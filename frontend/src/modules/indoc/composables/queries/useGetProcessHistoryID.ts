import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { ProcessingEventVM } from '@/shared/services/api'
import type { AxiosError } from 'axios'
import inDocService from '../../inDocService'

export const useGetProcessHistoryID = (
  documentId: MaybeRefOrGetter<string | null>,
  options?: QueryOptions<ProcessingEventVM, AxiosError>
) => {
  return useQuery<ProcessingEventVM, AxiosError>({
    queryKey: computed(() => ['get-process-history', documentId]),
    queryFn: () => inDocService.getProcessHistoryIndoc(toValue(documentId)!),
    ...options
  })
}
