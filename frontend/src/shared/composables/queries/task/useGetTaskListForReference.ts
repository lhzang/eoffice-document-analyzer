import type { QueryOptions, TCommonGetListParams, TResponseListData } from '@/shared/models/common'
import type { TaskVM } from '@/shared/services/api'
import { sharedTaskDocumentService } from '@/shared/services/task/task-documentServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetTaskListForReference = (
  payload: MaybeRefOrGetter<TCommonGetListParams>,
  options?: QueryOptions<TResponseListData<TaskVM>, TServerError>
) => {
  return useQuery<TResponseListData<TaskVM>, TServerError>({
    queryKey: ['getDocFromTaskReference', payload],
    queryFn: () => sharedTaskDocumentService.getTasks(toValue(payload)),
    ...options
  })
}
