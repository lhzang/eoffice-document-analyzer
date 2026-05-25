import type { TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { ListGuestCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetGuestCarList = (
  guestGetListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search?: MaybeRefOrGetter<string>,
  options?: QueryOptions<TResponseListData<ListGuestCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListGuestCarVM>, TServerError>({
    queryKey: ['getGuestCarList', guestGetListPayload, search],
    queryFn: () =>
      carRegisterService.getGuestCarList(toValue(guestGetListPayload), toValue(search)),
    ...options
  })
}
