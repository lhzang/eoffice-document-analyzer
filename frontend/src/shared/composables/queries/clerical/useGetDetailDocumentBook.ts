import type { QueryOptions } from '@/shared/models/common'
import type { DocumentBookDetailVM } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetDetailDocumentBook = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<DocumentBookDetailVM, TServerError>
) => {
  return useQuery<DocumentBookDetailVM, TServerError>({
    queryKey: ['getDetailDocumentBook', id],
    queryFn: () => sharedDocumentBookService.getBook(toValue(id)),
    ...options
  })
}
