import type { TCarStatus, TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { RequestAndCreatedStaffCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetRequestStaffCarList = (
  getListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search: MaybeRefOrGetter<string>,
  status: MaybeRefOrGetter<TCarStatus[]>,
  options?: QueryOptions<TResponseListData<RequestAndCreatedStaffCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<RequestAndCreatedStaffCarVM>, TServerError>({
    queryKey: ['getRequestStaffCarList', getListPayload, search, status],
    queryFn: () =>
      carRegisterService.getRequestStaffCarList(
        toValue(getListPayload),
        toValue(search),
        toValue(status)
      ),
    ...options
  })
}
