import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultSearchDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetDocSearchPayload } from '../../models'
import { docSearchServices } from '../../services'

export const useGetDocSearch = (
  payload: MaybeRefOrGetter<TGetDocSearchPayload>,
  options?: QueryOptions<PaginatedResultSearchDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultSearchDocumentVM, TServerError>({
    queryKey: ['getAvailableActions', payload],
    queryFn: () => docSearchServices.getDocSearch(toValue(payload)),
    ...options
  })
}
