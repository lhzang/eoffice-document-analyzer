import { useQuery } from '@tanstack/vue-query'

import { appConfig } from '@/config/app-config'
import type { QueryOptions } from '@/shared/models/common'

export const useGetListAbleToDistributeUnits = (options?: QueryOptions<any, TServerError>) => {
  return useQuery<any, TServerError>({
    queryKey: ['get-list-able-to-distribute-units'],
    queryFn: () => {
      return fetch(`${appConfig.VITE_API_SERVER}/api/in-documents/list-distribute-unit`, {
        headers: { Authorization: 'asdfasdf' }
      }).then((val) => val.json())
    },
    ...options
  })
}
