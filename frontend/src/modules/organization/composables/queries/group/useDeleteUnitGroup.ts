import { unitGroupService } from '@/modules/organization/services/unitGroupService'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useDeleteUnitGroup = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => unitGroupService.delete(id),
    onError: (e) => notifyError(e, 'Xóa khối đơn vị thất bại'),
    ...options
  })
