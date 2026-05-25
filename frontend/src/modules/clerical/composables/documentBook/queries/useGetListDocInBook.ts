import type { QueryOptions, TCommonGetListParams } from '@/shared/models/common'
import type { PaginatedResultDocumentByDocumentBookVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import documentBookService from '../../../services/documentBookService'

export const useGetListDocInBook = (
  documentBookId: MaybeRefOrGetter<string>,
  payload: MaybeRefOrGetter<TCommonGetListParams>,
  options?: QueryOptions<PaginatedResultDocumentByDocumentBookVM, TServerError>
) => {
  return useQuery<PaginatedResultDocumentByDocumentBookVM, TServerError>({
    queryKey: ['getDocsInBook', documentBookId, payload],
    queryFn: () => documentBookService.getListDocInBook(toValue(documentBookId), toValue(payload)),
    ...options
  })
}
