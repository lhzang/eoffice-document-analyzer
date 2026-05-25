import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryWithKeyOptions, TResponseListData } from '@/shared/models/common'
import type { InDocDocumentVM } from '@/shared/services/api'
import { omit } from 'lodash-es'
import inDocService from '../../inDocService'
import type { TIDNeedHandleStatus, TToProcessDocsGetPayload } from '../../models/types'

export const useGetToProcessInDoc = (
  status: MaybeRefOrGetter<TIDNeedHandleStatus>,
  payload: MaybeRefOrGetter<TToProcessDocsGetPayload>,
  options?: QueryWithKeyOptions<TResponseListData<InDocDocumentVM>, TServerError>
) => {
  return useQuery<TResponseListData<InDocDocumentVM>, TServerError>({
    queryKey: [...(toValue(options?.queryKey) ?? ['get-need-handle-in-doc']), payload, status],
    queryFn: () => inDocService.getToProcessInDoc(toValue(payload), toValue(status)),
    ...omit(options, 'queryKey')
  })
}
