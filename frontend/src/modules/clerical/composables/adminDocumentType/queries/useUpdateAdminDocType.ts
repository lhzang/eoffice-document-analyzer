import type { MutationOptions } from '@/shared/models/common'
import type { UpdateDocumentTypeCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import adminDocTypeService from '../../../services/adminDocumentTypeService'

type TPayload = {
  id: string
  data: UpdateDocumentTypeCommand
}

export const useUpdateAdminDocType = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, data }) => adminDocTypeService.updateType(id, data),
    onError: (e) => notifyError(e, 'Cập nhật loại văn bản thất bại'),
    ...options
  })
