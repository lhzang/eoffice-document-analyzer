import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import unitService from '../../services/unitService'

export const useDeleteUnit = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => unitService.deleteUnit(id),
    onError: (e) => notifyError(e, 'Xóa đơn vị thất bại'),
    ...options
  })
