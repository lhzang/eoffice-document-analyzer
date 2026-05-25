import { useQuery } from '@tanstack/vue-query'
import { userAccountService } from '../../services/userAccountService'

export const useGetUserAccount = (email?: string) => {
  return useQuery({
    queryKey: ['getUserAccount', email],
    queryFn: async () => {
      return await userAccountService.getUserAccount(email)
    }
  })
}
