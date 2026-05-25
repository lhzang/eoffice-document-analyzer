import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import type { Pageable } from '@/shared/services/api'
import inDocService from '../../inDocService'
import type { PageListDocumentCreatedDTO, TCommonIndocFilter } from '../../models/types'

export type TGetDocumentCreatedPayload = TCommonIndocFilter & {
  termId: string
  pageable: Pageable
}

export const useGetDocumentCreated = (
  termId: string,
  payload: MaybeRefOrGetter<TGetDocumentCreatedPayload>,
  options?: QueryOptions<
    PageListDocumentCreatedDTO,
    ['getDocumentBooks', TGetDocumentCreatedPayload],
    TServerError
  >
) => {
  return useQuery({
    queryKey: computed(() => ['get-in-document-created', toValue(payload)]),
    queryFn: () => {
      const { termId, pageable, ...filter } = toValue(payload)
      return inDocService.getDocumentCreated(pageable)
    },
    ...options
  })
}
