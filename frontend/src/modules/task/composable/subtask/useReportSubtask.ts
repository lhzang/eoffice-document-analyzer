import type { MutationOptions } from '@/shared/models/common'
import type { SubtaskReportRequest } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import subtaskService from '../../service/subtask'

type TPayload = { subtaskId: string; request: SubtaskReportRequest; files?: File[] }

export const useReportSubtask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['reportSubtask'],
    mutationFn: ({ subtaskId, request, files }) =>
      subtaskService.reportSubtask(subtaskId, request, files),
    ...options
  })
