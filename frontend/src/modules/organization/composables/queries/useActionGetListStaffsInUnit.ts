import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { MutationOptions } from '@/shared/models/common'
import type { StaffVM } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
type TPayload = {
  unitId: string
  permissionFilter?: TAppFeatureKey
}
export const useActionGetListStaffsInUnit = (
  options?: MutationOptions<StaffVM[], TServerError, TPayload>
) =>
  useMutation<StaffVM[], TServerError, TPayload>({
    mutationFn: ({ unitId, permissionFilter }) =>
      sharedUnitService.getUsersInUnitNoPaginate(unitId, permissionFilter),
    onError: (e) => notifyError(e, 'Có lỗi khi lấy danh sách nhân sự'),
    ...options
  })
