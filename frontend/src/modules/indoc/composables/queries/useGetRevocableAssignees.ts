import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { ReceiverVM } from '@/shared/services/api'
import type { AxiosError } from 'axios'
import { getRevocableAssignees } from '../../services/getRevocableAssignees'

export const useGetRevocableAssignees = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<Array<ReceiverVM>, AxiosError>
) => {
  return useQuery<Array<ReceiverVM>, AxiosError>({
    queryKey: ['get-revocable-assignees', documentId],
    queryFn: () => getRevocableAssignees(toValue(documentId)),
    ...options
  })
}



