import type { MutationOptions } from '@/shared/models/common'
import type { FilesBySource } from '@/shared/models/document'
import { useMutation } from '@tanstack/vue-query'
import type { CreateTaskFormValues } from '../../models/type'
import createTaskService from '../../service/createTask'
type TPayload = { formValues: CreateTaskFormValues; filesBySource: FilesBySource }
export const useCreateTask = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationKey: ['createTask'],
    mutationFn: ({ formValues, filesBySource }) =>
      createTaskService.processAndCreateTask(formValues, filesBySource),
    ...options
  })
