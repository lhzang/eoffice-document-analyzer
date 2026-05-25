import type { TCommonGetListParams } from '@/shared/models/common'
import { mappingServerPaginatedData } from '@/shared/utils/common'
import { TaskApi } from '../api'
import { apiClientConfig } from '../apiClientConfig'

const taskApi = new TaskApi(apiClientConfig)

export const sharedTaskDocumentService = {
  getTasks: async (payload: TCommonGetListParams) => {
    const { search, page, size, sort } = payload
    const pageable = {
      page: page,
      size: size,
      sort: sort
    }
    const filterRequest = {
      name: search ?? ''
    }
    const result = await taskApi.getRelatedTasks(filterRequest, pageable)
    return mappingServerPaginatedData(result.data)
  }
}
