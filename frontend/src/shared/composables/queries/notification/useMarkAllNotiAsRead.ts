import type { MutationOptions } from '@/shared/models/common'
import { notificationService } from '@/shared/services/notification/notificationService'
import { useMutation } from '@tanstack/vue-query'

export const useMarkAllNotiAsRead = (options?: MutationOptions<void, TServerError>) => {
  return useMutation<void, TServerError>({
    mutationFn: () => notificationService.markAllNotiAsRead(),
    ...options
  })
}
