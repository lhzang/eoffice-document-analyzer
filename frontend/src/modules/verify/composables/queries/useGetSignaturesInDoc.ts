/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QueryOptions } from '@/shared/models/common'
import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import { verifyServices } from '../../verifyServices'

export const useGetSignaturesInDoc = (
  file: MaybeRefOrGetter<File>,
  options?: QueryOptions<any>
) => {
  return useQuery<any>({
    queryKey: ['getSignaturesInDoc', file],
    queryFn: () => verifyServices.getSignaturesInfoOfDocument(toValue(file)),
    ...options
  })
}
