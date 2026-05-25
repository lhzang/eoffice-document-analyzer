import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryWithKeyOptions, TResponseListData } from '@/shared/models/common'
import type { InDocDocumentVM } from '@/shared/services/api'
import type { AxiosError } from 'axios'
import { omit } from 'lodash-es'
import inDocService from '../../inDocService'
import type { TToProcessDocsGetPayload } from '../../models/types'

export const useGetToCreatedInDoc = (
  payload: MaybeRefOrGetter<TToProcessDocsGetPayload>,
  options?: QueryWithKeyOptions<TResponseListData<InDocDocumentVM>, AxiosError>
) => {
  return useQuery<TResponseListData<InDocDocumentVM>, AxiosError>({
    queryKey: [...(toValue(options?.queryKey) ?? ['get-created-in-doc']), payload],
    queryFn: () => inDocService.getDocumentCreated(toValue(payload)),
    ...omit(options, 'queryKey')
  })
}
