import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import inDocService from '../../inDocService'

import type { QueryWithKeyOptions, TResponseListData } from '@/shared/models/common'
import type { InDocDocumentVM, Pageable } from '@/shared/services/api'
import type { AxiosError } from 'axios'
import { omit } from 'lodash-es'
import type { TCommonIndocFilter, TToProcessDocsGetPayload } from '../../models/types'

export type TGetRevokedInDocPayload = TCommonIndocFilter & {
  termId: string
  pageable: Pageable
}

export const useGetRejectedInDoc = (
  payload: MaybeRefOrGetter<TToProcessDocsGetPayload>,
  options?: QueryWithKeyOptions<TResponseListData<InDocDocumentVM>, AxiosError>
) => {
  return useQuery<TResponseListData<InDocDocumentVM>, AxiosError>({
    queryKey: [...(toValue(options?.queryKey) ?? ['get-in-document-rejected']), payload],
    queryFn: () => inDocService.getDocumentRejected(toValue(payload)),
    ...omit(options, 'queryKey')
  })
}
