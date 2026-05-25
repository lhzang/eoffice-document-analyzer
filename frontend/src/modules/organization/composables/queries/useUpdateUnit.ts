import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TUnitUpdatePayload } from '../../models/unit'
import unitService from '../../services/unitService'

type TPayload = {
  id: string
  payload: TUnitUpdatePayload
}

export const useUpdateUnit = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation({
    mutationFn: ({ id, payload }) => unitService.updateUnit(id, payload),
    onError: (e) => notifyError(e, 'Cập nhật thông tin đơn vị thất bại'),
    ...options
  })
