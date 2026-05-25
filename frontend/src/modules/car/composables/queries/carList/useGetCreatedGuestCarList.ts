import type { TCarStatus, TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { RequestAndCreatedGuestCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetCreatedGuestCarList = (
  getListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search: MaybeRefOrGetter<string>,
  status: MaybeRefOrGetter<TCarStatus[]>,
  options?: QueryOptions<TResponseListData<RequestAndCreatedGuestCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<RequestAndCreatedGuestCarVM>, TServerError>({
    queryKey: ['getCreatedGuestCarList', getListPayload, search, status],
    queryFn: () =>
      carRegisterService.getCreatedGuestCarList(
        toValue(getListPayload),
        toValue(search),
        toValue(status)
      ),
    ...options
  })
}
