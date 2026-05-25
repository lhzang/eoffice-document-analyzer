import { unitGroupService } from '@/modules/organization/services/unitGroupService'
import type { MutationOptions } from '@/shared/models/common'
import type { UpdateGroupCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TPayload = {
  id: string
  body: UpdateGroupCommand
}

export const useUpdateUnitGroup = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => unitGroupService.update(id, body),
    onError: (e) => notifyError(e, 'Cập nhật khối đơn vị thất bại'),
    ...options
  })
