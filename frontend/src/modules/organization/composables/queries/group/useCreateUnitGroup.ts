import { unitGroupService } from '@/modules/organization/services/unitGroupService'
import type { MutationOptions } from '@/shared/models/common'
import type { CreateGroupCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useCreateUnitGroup = (
  options?: MutationOptions<void, TServerError, CreateGroupCommand>
) =>
  useMutation<void, TServerError, CreateGroupCommand>({
    mutationFn: (payload) => unitGroupService.create(payload),
    onError: (e) => notifyError(e, 'Tạo mới khối đơn vị thất bại'),
    ...options
  })
