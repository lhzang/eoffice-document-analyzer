import type { QueryOptions } from '@/shared/models/common'
import type { SearchResponse } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TDocSearchPayload } from '../../models/documentSearch'
import { documentSearchService } from '../../services/documentSearchService'

export const useSearchDocument = (
  params: MaybeRefOrGetter<TDocSearchPayload>,
  options?: QueryOptions<SearchResponse, TServerError>
) => {
  return useQuery<SearchResponse, TServerError>({
    queryKey: ['getStaffWithGlobalDeleteCarPermission', params],
    queryFn: () => documentSearchService.searchDocument(toValue(params)),
    ...options
  })
}
