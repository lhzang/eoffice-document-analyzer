import { useQuery, type QueryObserverOptions } from '@tanstack/vue-query'
import { computed, unref, type Ref } from 'vue'

import type { EdocDetailDTO } from '@/shared/services/api'
import inDocService from '../../inDocService'

type UseDocumentDetailQueryOptions = QueryObserverOptions<
  EdocDetailDTO,
  Error,
  EdocDetailDTO,
  EdocDetailDTO,
  (string | TEDocDetailParams)[]
>

export type TEDocDetailParams = {
  orgId: string
  promulgationDate: string
  codeNumber: string
  codeNotation: string
}

export const useGetEDocDetail = (
  params: Ref<TEDocDetailParams>,
  options?: Partial<UseDocumentDetailQueryOptions>
) => {
  return useQuery({
    queryKey: computed(() => ['get-e-document-detail', unref(params)]),
    queryFn: () => {
      const { orgId, promulgationDate, codeNumber, codeNotation } = unref(params)
      return inDocService.getDetailEdoc(orgId, promulgationDate, codeNumber, codeNotation)
    },
    ...options
  })
}
