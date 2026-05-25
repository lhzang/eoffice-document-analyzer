import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryWithKeyOptions, TResponseListData } from '@/shared/models/common'
import type { InDocDocumentVM } from '@/shared/services/api'
import type { AxiosError } from 'axios'
import { omit } from 'lodash-es'
import inDocService from '../../inDocService'
import type { TDocumentFromInternetTabs, TGetPendingReceiveInDocPayload } from '../../models/types'

// export type TGetPendingReceiveInDocPayload = TCommonIndocFilter & {
//   pageable: Pageable
// }

export const useGetPendingReceiveInDoc = (
  status: MaybeRefOrGetter<TDocumentFromInternetTabs>,
  payload: MaybeRefOrGetter<TGetPendingReceiveInDocPayload>,
  options?: QueryWithKeyOptions<TResponseListData<InDocDocumentVM>, TServerError>
) => {
  return useQuery<TResponseListData<InDocDocumentVM>, AxiosError>({
    queryKey: [...(toValue(options?.queryKey) ?? ['get-pending-receive-in-doc']), payload, status],
    queryFn: () => inDocService.getPendingReceiveInDoc(toValue(payload), toValue(status)),
    ...omit(options, 'queryKey')
  })
}
