import type { TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { ListStaffCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetStaffCarList = (
  staffGetListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search?: MaybeRefOrGetter<string>,
  options?: QueryOptions<TResponseListData<ListStaffCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListStaffCarVM>, TServerError>({
    queryKey: ['getStaffCarList', staffGetListPayload, search],
    queryFn: () =>
      carRegisterService.getStaffCarList(toValue(staffGetListPayload), toValue(search)),
    ...options
  })
}
