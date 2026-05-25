import type { TGetReportDocumentBookPayload } from '@/modules/clerical/model/documentBookType'
import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultDocumentBookReportVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import documentBookService from '../../../services/documentBookService'

export const useGetReportDocumenBook = (
  documentBookId: MaybeRefOrGetter<string>,
  payload: MaybeRefOrGetter<TGetReportDocumentBookPayload>,
  options?: QueryOptions<PaginatedResultDocumentBookReportVM, TServerError>
) => {
  return useQuery<PaginatedResultDocumentBookReportVM, TServerError>({
    queryKey: ['getReportDocumentBook', documentBookId, payload],
    queryFn: () =>
      documentBookService.reportDocumentBook(toValue(documentBookId), toValue(payload)),
    ...options
  })
}
