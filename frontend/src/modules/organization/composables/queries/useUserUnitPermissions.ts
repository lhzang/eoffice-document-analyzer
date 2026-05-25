import { AccessControlApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useQuery } from '@tanstack/vue-query'
import type { TenantWithNameOnlyVM } from '@/shared/services/api'

const accessControlApi = new AccessControlApi(apiClientConfig)

export function useUserUnitPermissions(permission: string) {
  return useQuery({
    queryKey: ['userUnitPermissions', permission],
    queryFn: async (): Promise<TenantWithNameOnlyVM[]> => {
        const response = await accessControlApi.getTenantsAffected(permission)
        return response.data
    }
  })
}

