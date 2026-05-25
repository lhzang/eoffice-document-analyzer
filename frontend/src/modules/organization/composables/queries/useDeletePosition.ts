import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import positionService from '../../services/positionService'

export const useDeletePosition = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => positionService.deletePosition(id),
    onError: (e) => notifyError(e, 'Xoá chức vụ người dùng thất bại'),
    ...options
  })
