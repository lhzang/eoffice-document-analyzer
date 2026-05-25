import type { MutationOptions, TServerError } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

type TPayload = { subtaskId: string; reason?: string }

export const useRejectSubtask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['rejectSubtask'],
    mutationFn: ({ subtaskId, reason }) => subtaskService.rejectSubtask(subtaskId, reason),
    ...options
  })
