import type { TGetRegisterNumberPayload } from '@/shared/models/clerical/documentBook.shared'
import type { QueryOptions } from '@/shared/models/common'
import type { PaginatedResultListRegisteredKeepNumberVM } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetRegisterNumber = (
  getListPayload: MaybeRefOrGetter<TGetRegisterNumberPayload>,
  options?: QueryOptions<PaginatedResultListRegisteredKeepNumberVM, TServerError>
) => {
  return useQuery<PaginatedResultListRegisteredKeepNumberVM, TServerError>({
    queryKey: ['getRegisterNumber', getListPayload],
    queryFn: () => sharedDocumentBookService.getRegisteredNumber(toValue(getListPayload)),
    ...options
  })
}
