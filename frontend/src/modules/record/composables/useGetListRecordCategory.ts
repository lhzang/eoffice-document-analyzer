import type { RecordCategoryQuery } from '@/shared/services/api'
import { RecordCategoryApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue'

const api = new RecordCategoryApi(apiClientConfig)

export const useGetRecordCategoryList = (
  params: () => {
    query: RecordCategoryQuery
    page: number
    size: number
  }
) => {
  return useQuery({
    queryKey: computed(() => ['record-categories', unref(params)]),
    queryFn: async () => {
      const { query, page, size } = params()
      const res = await api.getRecordCategoryList(query, page, size)
      return res.data
    }
  })
}
