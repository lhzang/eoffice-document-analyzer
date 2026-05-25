import type { TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { ListStudentCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetStudentCarList = (
  studentGetListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search?: MaybeRefOrGetter<string>,
  options?: QueryOptions<TResponseListData<ListStudentCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListStudentCarVM>, TServerError>({
    queryKey: ['getStudentCarList', studentGetListPayload, search],
    queryFn: () =>
      carRegisterService.getStudentCarList(toValue(studentGetListPayload), toValue(search)),
    ...options
  })
}
