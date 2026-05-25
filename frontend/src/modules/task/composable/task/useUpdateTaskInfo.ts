import type { MutationOptions } from '@/shared/models/common'
import type { UpdateTaskInfoRequest } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import { updateTaskInfo } from '../../service/updateTask'

type TPayload = { taskId: string; request: UpdateTaskInfoRequest }

export const useUpdateTaskInfo = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['updateTaskInfo'],
    mutationFn: ({ taskId, request }) => updateTaskInfo(taskId, request),
    ...options
  })
