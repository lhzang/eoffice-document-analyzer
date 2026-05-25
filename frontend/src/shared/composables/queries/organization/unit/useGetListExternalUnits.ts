import { APP_PAGE_SIZE } from '@/shared/constants/common'
import type { InfiniteQueryOptions, QueryOptions } from '@/shared/models/common'
import type {
  TGetInfiniteListExternalUnitPayload,
  TGetInfiniteListExternalUnitsResponse,
  TGetListExternalUnitPayload,
  TGetListExternalUnitsResponse
} from '@/shared/models/organization/unit'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'

export const useGetListExternalUnit = (
  payload: Ref<TGetListExternalUnitPayload>,
  isSortByName: Ref<boolean>,
  options?: QueryOptions<TGetListExternalUnitsResponse, TServerError>
) =>
  useQuery({
    queryKey: ['getListExternalUnit', payload, isSortByName],
    queryFn: () =>
      sharedUnitService.getExternalUnits(
        payload.value.name,
        payload.value.page,
        payload.value.size ?? APP_PAGE_SIZE,
        isSortByName.value ? ['name,asc'] : undefined
      ),
    ...options
  })

export const useGetInfiniteListExternalUnits = (
  payload: Ref<TGetInfiniteListExternalUnitPayload>,
  isSortByName: Ref<boolean>,
  options?: InfiniteQueryOptions<
    TGetListExternalUnitsResponse,
    TServerError,
    readonly ['getExternalUnits', TGetInfiniteListExternalUnitPayload, boolean],
    TGetInfiniteListExternalUnitsResponse
  >
) => {
  const queryKey = computed(() => ['getExternalUnits', payload.value, isSortByName.value] as const)
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => {
      return sharedUnitService.getExternalUnits(
        payload.value.name,
        pageParam as number,
        payload.value.pageSize ?? APP_PAGE_SIZE,
        isSortByName.value ? ['name,asc'] : undefined
      )
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.pageNumber < lastPage.totalPages - 1 ? lastPage.pageNumber + 1 : undefined
    },
    ...options
  })
}
