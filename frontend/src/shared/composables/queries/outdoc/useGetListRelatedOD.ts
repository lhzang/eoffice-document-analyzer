import type { QueryOptions } from '@/shared/models/common'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { TResponseListData } from '@/shared/models/types'
import type { Pageable } from '@/shared/services/api'
import { sharedOutDocService } from '@/shared/services/outdoc/out-documentServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetListRelatedOD = (
  pageable: MaybeRefOrGetter<Pageable>,
  filterPayload: MaybeRefOrGetter<TGetRelatedFilterPayload>,
  options?: QueryOptions<TResponseListData<TResponseRelatedDoc>, TServerError>
) => {
  return useQuery<TResponseListData<TResponseRelatedDoc>, TServerError>({
    queryKey: ['getRelatedOD', pageable, filterPayload],
    queryFn: async () =>
      sharedOutDocService.getODRelatedDocs(toValue(pageable), toValue(filterPayload)),
    ...options
  })
}
