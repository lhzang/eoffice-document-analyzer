import type { QueryOptions } from '@/shared/models/common'
import type { DetailDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { internalDocServices } from '../../services/document'

export const useGetDetailInternalDoc = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<DetailDocumentVM, TServerError>
) => {
  return useQuery<DetailDocumentVM, TServerError>({
    queryKey: ['getDetailOutDoc', id],
    queryFn: () => internalDocServices.getDetailInternalDoc(toValue(id)),
    ...options
  })
}
