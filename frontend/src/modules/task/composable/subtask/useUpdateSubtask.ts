import type { MutationOptions } from '@/shared/models/common'
import type { UpdateSubtaskRequest } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'
type TPayload = { subtaskId: string; request: UpdateSubtaskRequest }
export const useUpdateSubtask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['updateSubtask'],
    mutationFn: ({ subtaskId, request }) => subtaskService.updateSubtask(subtaskId, request),
    ...options
  })
