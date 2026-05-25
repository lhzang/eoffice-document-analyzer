import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'

export const useReadDoc = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (docId) => inDocService.readDoc(docId),
    ...options
  })
