import { useQuery } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'

import { APP_PAGE_SIZE } from '@/shared/constants/common'
import inDocService from '../../inDocService'

import type { MaybeRefOrGetter } from 'vue'
import type { TCommonIndocFilter, TEDocReviewTabs } from '../../models/types'

export type IFilterParamsPayload = TCommonIndocFilter & Record<'activeTab', TEDocReviewTabs>

export const useGetEDocReview = (
  activeTab: MaybeRefOrGetter<TEDocReviewTabs>,
  payload: MaybeRefOrGetter<TCommonIndocFilter>
) => {
  return useQuery({
    queryKey: computed(() => ['get-e-document-review', toValue(payload), toValue(activeTab)]),
    queryFn: ({ pageParam }) => {
      let payloadValue = toValue(payload)
      const pageSize = payloadValue.pageSize ?? APP_PAGE_SIZE
      const activeTabValue = toValue(activeTab)

      console.log('🚀 ~ payloadValue:', payloadValue)
      console.log('🚀 ~ payloadValue:', activeTabValue)

      if (activeTabValue === 'WAIT_FOR_PROCESSING')
        payloadValue = {
          ...payloadValue,
          receiverStatus: ['INBOX']
        }
      else
        payloadValue = {
          ...payloadValue,
          receiverStatus: ['ACCEPTANCE', 'ASSIGNMENT', 'FINISH', 'PROCESSING', 'REJECTION', 'SENT']
        }
      console.log('🚀 ~ payloadValue:', payloadValue)
      return inDocService.getAllEdocs(payloadValue)
    }
  })
}
