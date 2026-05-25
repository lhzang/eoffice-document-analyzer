import type { TGetStaffInUnitParams } from '@/shared/models/organization/unit'
import type { PaginatedResultStaffVM } from '@/shared/services/api'
import type { UseQueryOptions } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { toValue, type MaybeRefOrGetter } from 'vue'
import unitService from '../../services/unitService'

export const useGetStaffInUnit = (
  payload: MaybeRefOrGetter<TGetStaffInUnitParams>,
  options?: Omit<UseQueryOptions<PaginatedResultStaffVM, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResultStaffVM, AxiosError>({
    queryKey: ['staff-in-unit', payload],
    queryFn: () => unitService.getStaffInUnit(toValue(payload)),
    ...options
  })
}
