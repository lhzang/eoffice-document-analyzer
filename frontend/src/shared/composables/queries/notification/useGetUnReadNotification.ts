import type { QueryOptions } from '@/shared/models/common'
import { notificationService } from '@/shared/services/notification/notificationService'
import { useQuery } from '@tanstack/vue-query'

export const useGetUnReadNotification = (options?: QueryOptions<number, TServerError>) => {
  return useQuery<number, TServerError>({
    queryKey: ['getUnreadNotiCount'],
    queryFn: () => notificationService.getUnreadNotiNumber(),
    ...options
  })
}
