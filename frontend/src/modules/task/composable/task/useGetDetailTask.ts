import type { QueryOptions } from '@/shared/models/common'
import type { TaskVM } from '@/shared/services/api'
import taskService from '../../service/task'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { toValue, computed, type MaybeRefOrGetter } from 'vue'

export const useGetTaskById = (
  taskId: MaybeRefOrGetter<string>,
  options?: QueryOptions<TaskVM, AxiosError>
) => {
  return useQuery<TaskVM, AxiosError>({
    queryKey: ['getTaskById', taskId],
    queryFn: () => taskService.getTaskById(toValue(taskId)),
    enabled: () => !!taskId,
    ...options
  })
}