import type { QueryOptions, TCommonGetListParams } from '@/shared/models/common'
import type { PaginatedResultLeaderSecretariesVM } from '@/shared/services/api'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import secretaryService from '../../services/secretaryService'

export const useGetListSecretaryConfig = (
  payload: MaybeRefOrGetter<TCommonGetListParams>,
  options?: QueryOptions<PaginatedResultLeaderSecretariesVM, TServerError>
) =>
  useQuery<PaginatedResultLeaderSecretariesVM, TServerError>({
    queryKey: ['getListSecretaryList', payload],
    queryFn: () => secretaryService.getListSecretaryConfig(toValue(payload)),
    ...options
  })
