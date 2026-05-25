import type { MutationOptions } from '@/shared/models/common'
import type { CreateDocumentTypeCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import adminDocTypeService from '../../../services/adminDocumentTypeService'

export const useAddNewAdminDocType = (
  options?: MutationOptions<void, TServerError, CreateDocumentTypeCommand>
) =>
  useMutation<void, TServerError, CreateDocumentTypeCommand>({
    mutationFn: (payload: CreateDocumentTypeCommand) => adminDocTypeService.addNewType(payload),
    onError: (e) => notifyError(e, 'Thêm mới loại văn bản thất bại'),
    ...options
  })
