import type { MutationOptions } from '@/shared/models/common'
import type { CreatePositionCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import positionService from '../../services/positionService'

export const useCreatePosition = (
  options?: MutationOptions<string, TServerError, CreatePositionCommand>
) =>
  useMutation<string, TServerError, CreatePositionCommand>({
    mutationFn: (payload) => positionService.createPosition(payload),
    onError: (e) => notifyError(e, 'Thêm chức vụ cho người dùng thất bại'),
    ...options
  })
