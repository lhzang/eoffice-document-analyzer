import type { MutationOptions } from '@/shared/models/common'
import type { UnitInfoVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useActionGetUnitInfo = (options?: MutationOptions<UnitInfoVM, TServerError, string>) =>
  useMutation<UnitInfoVM, TServerError, string>({
    mutationFn: (unitId: string) => sharedUnitService.getUnitInfo(unitId),
    onError: (e) => notifyError(e, 'Có lỗi khi lấy thông tin đơn vị'),
    ...options
  })
