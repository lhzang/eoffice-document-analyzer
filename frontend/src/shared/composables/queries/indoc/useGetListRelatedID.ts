import type { QueryOptions } from '@/shared/models/common'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { TResponseListData } from '@/shared/models/types'
import type { Pageable } from '@/shared/services/api'
import { sharedIndocService } from '@/shared/services/indoc/in-documentServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetListRelatedID = (
  pageable: MaybeRefOrGetter<Pageable>,
  filterPayload: MaybeRefOrGetter<TGetRelatedFilterPayload>,
  options?: QueryOptions<TResponseListData<TResponseRelatedDoc>, TServerError>
) => {
  return useQuery<TResponseListData<TResponseRelatedDoc>, TServerError>({
    queryKey: ['getRelatedID', filterPayload, pageable],
    queryFn: async () =>
      sharedIndocService.getIDRelatedDocs(toValue(pageable), toValue(filterPayload)),
    ...options
  })
}
