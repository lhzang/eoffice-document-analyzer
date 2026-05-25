import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import taskService from '../../service/task'

export const useDeleteTask = (option?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationKey: ['deleteTask'],
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    ...option
  })
