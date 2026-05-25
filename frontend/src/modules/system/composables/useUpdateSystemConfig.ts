import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TUpdateSystemConfigParams } from '../models/type'
import { systemService } from '../services/systemService'

export type { TUpdateSystemConfigParams }

export const useUpdateSystemConfig = (
  options?: MutationOptions<void, TServerError, TUpdateSystemConfigParams>
) =>
  useMutation<void, TServerError, TUpdateSystemConfigParams>({
    mutationFn: (params: TUpdateSystemConfigParams) => systemService.updateSystemRoleConfig(params),
    onError: (e) => notifyError(e, 'Cập nhật thất bại'),
    ...options
  })
