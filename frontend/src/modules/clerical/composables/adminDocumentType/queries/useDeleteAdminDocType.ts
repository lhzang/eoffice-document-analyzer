import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import adminDocTypeService from '../../../services/adminDocumentTypeService'

export const useDeleteAdminDocType = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id: string) => adminDocTypeService.deleteType(id),
    onError: (e) => notifyError(e, 'Xoá loại văn bản thất bại'),
    ...options
  })
