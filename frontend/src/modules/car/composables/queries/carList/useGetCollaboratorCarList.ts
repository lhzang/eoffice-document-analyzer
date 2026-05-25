import type { TCommonCarGetListParam } from '@/modules/car/models/common'
import { carRegisterService } from '@/modules/car/services/carService'
import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { ListCollaboratorCarVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetCollaboratorCarList = (
  collaboratorGetListPayload: MaybeRefOrGetter<TCommonCarGetListParam>,
  search?: MaybeRefOrGetter<string>,
  options?: QueryOptions<TResponseListData<ListCollaboratorCarVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListCollaboratorCarVM>, TServerError>({
    queryKey: ['getCollaboratorCarList', collaboratorGetListPayload, search],
    queryFn: () =>
      carRegisterService.getCollaboratorCarList(
        toValue(collaboratorGetListPayload),
        toValue(search)
      ),
    ...options
  })
}
