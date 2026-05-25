import type { QueryOptions, TResponseListData } from '@/shared/models/common'
import type { RecordVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { TGetListRecordParams } from '../models/records'
import { recordsService } from '../services/recordService'

export const useGetListRecords = (
  getListPayload: MaybeRefOrGetter<TGetListRecordParams>,
  options?: QueryOptions<TResponseListData<RecordVM>, TServerError>
) => {
  return useQuery<TResponseListData<RecordVM>, TServerError>({
    queryKey: ['getListRecord', getListPayload],
    queryFn: () => recordsService.getRecordsList(toValue(getListPayload)),
    ...options
  })
}
