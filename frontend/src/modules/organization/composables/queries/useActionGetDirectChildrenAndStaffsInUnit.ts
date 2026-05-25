import type { MutationOptions } from '@/shared/models/common'
import type { TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TPayload = {
  unitId: string
  relativeLevel?: number
  unitLevel?: number
}

export const useActionGetDirectChildrenAndStaffsInUnit = (
  options?: MutationOptions<TTreeUnitWithStaffNode[], TServerError, TPayload>
) =>
  useMutation<TTreeUnitWithStaffNode[], TServerError, TPayload>({
    mutationFn: ({ unitId, relativeLevel, unitLevel }) =>
      sharedUnitService.getTreeInternalUnitWithStaffs(
        undefined,
        undefined,
        unitId,
        1,
        relativeLevel,
        unitLevel
      ),
    onError: (e) => notifyError(e, 'Có lỗi khi lấy thông tin đơn vị'),
    ...options
  })
