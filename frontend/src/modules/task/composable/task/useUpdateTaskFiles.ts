import type { MutationOptions, TServerError } from '@/shared/models/common'
import type { UpdateTaskFileRequest } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import taskService from '../../service/task'
type TPayload = { taskId: string; request: UpdateTaskFileRequest; files: File[] }
export const useUpdateTaskFiles = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['updateTaskFiles'],
    mutationFn: ({ taskId, request, files }) => taskService.updateTaskFiles(taskId, request, files),
    ...options
  })
