import type { InfiniteQueryOptions } from '@/shared/models/common'
import type { TGetInfinityNotificationsPayload } from '@/shared/models/notification'
import type { PaginatedResultNotificationDTO } from '@/shared/services/api'
import { notificationService } from '@/shared/services/notification/notificationService'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { toValue, type Ref } from 'vue'

type TResponse = {
  pages: PaginatedResultNotificationDTO[]
  pageParams: number[]
}
export const useGetInfinityNotifications = (
  payload: Ref<TGetInfinityNotificationsPayload>,
  options?: InfiniteQueryOptions<
    PaginatedResultNotificationDTO,
    TServerError,
    readonly ['getExternalUnits', TGetInfinityNotificationsPayload],
    TResponse
  >
) => {
  return useInfiniteQuery({
    queryKey: ['getExternalUnits', payload] as const,
    queryFn: ({ pageParam }) => {
      const parsedPayload = toValue(payload)
      return notificationService.getNotifications(
        pageParam as number,
        parsedPayload.pageSize,
        parsedPayload.publishedBefore,
        parsedPayload.isRead
      )
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.pageNumber < lastPage.totalPages - 1 ? lastPage.pageNumber + 1 : undefined
    },
    ...options
  })
}
