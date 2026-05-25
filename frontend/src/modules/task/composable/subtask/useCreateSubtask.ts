import type { MutationOptions } from '@/shared/models/common'
import type { CreateSubtaskRequest } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

type TPayload = { taskId: string; request: CreateSubtaskRequest }

export const useCreateSubtask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['createSubtask'],
    mutationFn: ({ taskId, request }) => subtaskService.createSubtask(taskId, request),
    ...options
  })
