import { useQuery, type QueryOptions } from '@tanstack/vue-query'
import userService from '../services/userService'
import type { CurrentAccountDetailResponse } from '@/shared/services/api'

export const useGetUser = (
  options?: QueryOptions<CurrentAccountDetailResponse, TServerError>
) => {
  return useQuery<CurrentAccountDetailResponse, TServerError>({
    queryKey: ['getUserInfo'],
    queryFn: () => userService.getUser(),
    ...options
  })
}