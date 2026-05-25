import type { MutationOptions } from '@/shared/models/common'
import type { UpdateFlowCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { flowService } from '../../services/flowService'

export const useUpdateUnitFlow = (
  options?: MutationOptions<void, TServerError, UpdateFlowCommand>
) =>
  useMutation<void, TServerError, UpdateFlowCommand>({
    mutationFn: (payload) => flowService.updateFlow(payload),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình cập nhật luồng đơn vị'),
    ...options
  })
