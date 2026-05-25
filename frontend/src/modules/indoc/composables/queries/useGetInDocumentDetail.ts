import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { DetailInDocumentVM } from '@/shared/services/api'
import inDocService from '../../inDocService'

export const useGetInDocumentDetail = (
  documentId: MaybeRefOrGetter<string>,
  options?: QueryOptions<DetailInDocumentVM, TServerError>
) => {
  return useQuery<DetailInDocumentVM, TServerError>({
    queryKey: ['get-in-document-detail', documentId],
    queryFn: () => inDocService.getInDocDetail(toValue(documentId)),
    ...options
  })
}
