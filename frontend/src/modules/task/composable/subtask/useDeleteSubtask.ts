import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

export const useDeleteSubtask = (option?: MutationOptions<void, string, TServerError>) =>
  useMutation<void, TServerError, string>({
    mutationKey: ['deleteSubtask'],
    mutationFn: (subtaskId: string) => subtaskService.deleteSubtask(subtaskId),
    ...option
  })
