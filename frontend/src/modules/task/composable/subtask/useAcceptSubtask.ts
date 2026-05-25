import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

export const useAcceptSubtask = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationKey: ['acceptSubtask'],
    mutationFn: (subtaskId: string) => subtaskService.acceptSubtask(subtaskId),
    ...options
  })
