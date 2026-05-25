import type { QueryOptions } from '@/shared/models/common'
import type { SystemConfigVM } from '@/shared/services/api'
import { systemService } from '@/shared/services/systemService'
import { useQuery } from '@tanstack/vue-query'

export const useGetSystemConfig = (options?: QueryOptions<SystemConfigVM, TServerError>) => {
  return useQuery<SystemConfigVM, TServerError>({
    queryKey: ['useGetSystemConfig'],
    queryFn: () => systemService.getSystemConfig(),
    ...options
  })
}
