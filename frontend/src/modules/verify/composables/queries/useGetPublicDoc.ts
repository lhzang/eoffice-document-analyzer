import type { QueryOptions } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { verifyServices } from '../../verifyServices'

export const useGetPublicDoc = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<File, TServerError>
) => {
  return useQuery<File, TServerError>({
    queryKey: ['getPublicVerifyDoc', id],
    queryFn: () => verifyServices.downloadLatestFileByQrCode(toValue(id)),
    ...options
  })
}
