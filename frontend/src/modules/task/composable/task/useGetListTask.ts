import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultTaskVM } from '@/shared/services/api'
import taskService from '../../service/task'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TaskFilterRequest } from '../../models/type'

export const useGetListTasks = (
  payload: MaybeRefOrGetter<{
    filterRequest: TaskFilterRequest
    page?: number
    size?: number
    sort?: string[]
  }>,
  options?: QueryOptions<PaginatedResultTaskVM, AxiosError>
) => {
  return useQuery<PaginatedResultTaskVM, AxiosError>({
    queryKey: ['getListTasks', payload],
    queryFn: () => {
      const { filterRequest, page, size, sort } = toValue(payload)
      return taskService.getTasks({ filterRequest, page, size, sort })
    },
    ...options
  })
}














