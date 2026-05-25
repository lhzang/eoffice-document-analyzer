import type { QueryOptions } from '@/shared/models/common'
import type { DetailDocumentVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { outDocServices } from '../../services/document'

export const useGetDetailOutDoc = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<DetailDocumentVM, TServerError>
) => {
  return useQuery<DetailDocumentVM, TServerError>({
    queryKey: ['getDetailOutDoc', id],
    queryFn: () => outDocServices.getDetailOutDoc(toValue(id)),
    ...options
  })
}
