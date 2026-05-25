import { SearchApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TDocSearchPayload } from '../models/documentSearch'

const searchApi = new SearchApi(apiClientConfig)
export const documentSearchService = {
  searchDocument: async (params: TDocSearchPayload) => {
    const res = await searchApi.search(params?.sourceType, params?.search, params?.year)
    return res.data
  }
}
