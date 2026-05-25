import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TIssueDocStatusValue } from '../../../../shared/models/outDoc/document'
import type { TGetListOutDocPayload } from '../../models/document'
import { outDocServices } from '../../services/document'

export const useGetIssueODList = (
  getListPayload: MaybeRefOrGetter<TGetListOutDocPayload>,
  status: MaybeRefOrGetter<TIssueDocStatusValue>,
  options?: QueryOptions<PaginatedResultListDocumentVM, TServerError>
) => {
  return useQuery<PaginatedResultListDocumentVM, TServerError>({
    queryKey: ['getIssueOutDocList', getListPayload, status],
    queryFn: () => outDocServices.getIssueDocList(toValue(getListPayload), toValue(status)),
    ...options
  })
}
