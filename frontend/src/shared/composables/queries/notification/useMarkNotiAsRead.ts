import type { MutationOptions } from '@/shared/models/common'
import { notificationService } from '@/shared/services/notification/notificationService'
import { useMutation } from '@tanstack/vue-query'

export const useMarkNotiAsRead = (options?: MutationOptions<void, TServerError, string>) => {
  return useMutation<void, TServerError, string>({
    mutationFn: (id) => notificationService.markNotiAsRead(id),
    ...options
  })
}
