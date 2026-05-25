import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { Pageable } from '@/shared/services/api'
import { sharedInternalDocService } from '@/shared/services/internaldoc/internal-documentServices'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetListRelatedInternalDoc = (
  pageable: MaybeRefOrGetter<Pageable>,
  filterPayload: MaybeRefOrGetter<TGetRelatedFilterPayload>,
  options?: QueryOptions<TResponseListData<TResponseRelatedDoc>, TServerError>
) => {
  return useQuery<TResponseListData<TResponseRelatedDoc>, TServerError>({
    queryKey: ['getRelatedInternalDoc', pageable, filterPayload],
    queryFn: async () =>
      sharedInternalDocService.getInternalRelatedDocs(toValue(pageable), toValue(filterPayload)),
    ...options
  })
}
