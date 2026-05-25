import type { MutationOptions } from '@/shared/models/common'
import type { UpdatePositionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import positionService from '../../services/positionService'
export type TUpdatePositionPayload = {
  positionId: string
  payload: UpdatePositionCommand
}
export const useUpdatePositionInfo = (
  options?: MutationOptions<void, TServerError, TUpdatePositionPayload>
) =>
  useMutation<void, TServerError, TUpdatePositionPayload>({
    mutationFn: ({ positionId, payload }) => positionService.updatePosition(positionId, payload),
    onError: (e) => notifyError(e, 'Cập nhật chức vụ của người dùng thất bại'),
    ...options
  })
