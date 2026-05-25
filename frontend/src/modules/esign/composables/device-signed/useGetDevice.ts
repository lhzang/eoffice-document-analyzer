import { esignService } from '@/modules/esign/services/esignDeviceService'
import { useQuery } from '@tanstack/vue-query'

export const useGetDevice = (email?: string) => {
  return useQuery({
    queryKey: ['device-info', email],
    queryFn: async () => {
      const data = await esignService.getDeviceInfo(email)
      return Array.isArray(data) ? data : [data]
    }
  })
}
