import { useQuery } from '@tanstack/vue-query'
import { esignAccountService } from '../../services/esignAccountService'

export const useGetEsignAccount = (accountId?: string) => {
  return useQuery({
    queryKey: ['getEsignAccount', accountId],
    queryFn: () => {
      return esignAccountService.getEsignAccount(accountId)
    }
  })
}
