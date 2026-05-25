import type { TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { ListUniversityCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetUniCarList = (
  uniGetListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search?: MaybeRefOrGetter<string>,
  options?: QueryOptions<TResponseListData<ListUniversityCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListUniversityCarVM>, TServerError>({
    queryKey: ['getUniCarList', uniGetListPayload, search],
    queryFn: () => carRegisterService.getUniCarList(toValue(uniGetListPayload), toValue(search)),
    ...options
  })
}
