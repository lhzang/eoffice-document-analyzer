import type { TDocumentBookPayload } from '@/shared/models/clerical/documentBook.shared'
import type { QueryOptions, TCommonGetListParams, TResponseListData } from '@/shared/models/common'
import type { ListDocumentBooksVM } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDocumentBooks = (
  pagePayload: MaybeRefOrGetter<TCommonGetListParams>,
  filterPayload: MaybeRefOrGetter<TDocumentBookPayload>,
  options?: QueryOptions<TResponseListData<ListDocumentBooksVM>, TServerError>
) => {
  return useQuery<TResponseListData<ListDocumentBooksVM>, TServerError>({
    queryKey: ['getDocumentBooks', pagePayload, filterPayload],
    queryFn: () => sharedDocumentBookService.getBooks(toValue(pagePayload), toValue(filterPayload)),
    ...options
  })
}
