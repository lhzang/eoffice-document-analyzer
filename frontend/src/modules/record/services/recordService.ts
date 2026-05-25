import type { TResponseListData } from '@/shared/models/common'
import { RecordApi, type RecordQuery, type RecordVM } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { mappingServerPaginatedData } from '@/shared/utils/common'
import type { TGetListRecordParams } from '../models/records'

const recordsApi = new RecordApi(apiClientConfig)

export const recordsService = {
  getRecordsList: async (params: TGetListRecordParams): Promise<TResponseListData<RecordVM>> => {
    const query: RecordQuery = {
      isSubmitted: false,
      title: params.search || undefined
    }

    const result = await recordsApi.getRecordList(
      query,
      params.page,
      params.size,
      params.sort ?? []
    )

    return mappingServerPaginatedData(result?.data)
  }
}
