import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

export const useCompleteSubtask = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationKey: ['completeSubtask'],
    mutationFn: (subtaskId: string) => subtaskService.completeSubtask(subtaskId),
    ...options
  })
