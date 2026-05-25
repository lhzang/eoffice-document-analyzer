import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { esignService } from '@/modules/esign/services/esignHistoryService'
import type { SignedDoc, ApiSignedDoc } from '@/modules/esign/model/types'
import { mappingServerPaginatedData } from '@/shared/utils/common'
import type { TResponseListData } from '@/shared/models/common'

export const useSignedDocs = (
  paramsFn: MaybeRefOrGetter<{ page: number; pageSize: number }>
) => {
  const queryKey = computed(() => {
    const { page, pageSize } = toValue(paramsFn)
    return ['signedDocs', page, pageSize]
  })

  return useQuery<TResponseListData<SignedDoc>>({
    queryKey,
    queryFn: async () => {
      const { page, pageSize } = toValue(paramsFn)
      const res = await esignService.getSignedHistory(page, pageSize)
      console.log('API raw data:', res)
      const mappedData = mappingServerPaginatedData(res)
      console.log('Mapped data:', mappedData)

      return {
        docs: (mappedData.docs as ApiSignedDoc[]).map((item: ApiSignedDoc) => ({
          id: item._id,
          signTime: new Date(item.timestamp).toLocaleString(),
          creator: item.callerName,
          account: item.accountId,
          status: item.state === 'succeed' ? 'Ký thành công' : 'Thất bại',
          fileName: item.originalFile?.fileName || '',
          originalFile: item.originalFile?.fileUrl || '',
          signedFile: item.result?.fileUrl || ''
        })),
        page: mappedData.page,
        pageSize: mappedData.pageSize,
        pageCount: mappedData.pageCount,
        docCount: mappedData.docCount
      }
    }
  })
}
