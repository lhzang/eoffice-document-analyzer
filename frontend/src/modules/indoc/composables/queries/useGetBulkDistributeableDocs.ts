import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryWithKeyOptions, TResponseListData } from '@/shared/models/common'
import type { InDocDocumentVM } from '@/shared/services/api'
import { omit } from 'lodash-es'
import inDocService from '../../inDocService'
import type { TToProcessDocsGetPayload } from '../../models/types'

export const useGetBulkDistributeableDocs = (
  payload: MaybeRefOrGetter<TToProcessDocsGetPayload>,
  options?: QueryWithKeyOptions<TResponseListData<InDocDocumentVM>, TServerError>
) => {
  return useQuery<TResponseListData<InDocDocumentVM>, TServerError>({
    queryKey: [
      ...(toValue(options?.queryKey) ?? ['get-bulk-distributeable-in-doc']),
      payload,
      status
    ],
    queryFn: () => inDocService.getBulkDistributeableIndoc(toValue(payload)),
    ...omit(options, 'queryKey')
  })
}
