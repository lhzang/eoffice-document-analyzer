import { useQuery, type QueryObserverOptions } from '@tanstack/vue-query'

import { computed, unref, type MaybeRef } from 'vue'
import type { IRootDestination } from '../../models/types'
import { getRootDestination } from '../../services/getRootDestination'

type TUseQueryOptions = Omit<
  QueryObserverOptions<
    IRootDestination[],
    Error,
    IRootDestination[],
    IRootDestination[],
    (string | null)[]
  >,
  'enabled'
>

export const useGetRootDestinationID = (
  documentId: MaybeRef<string | null>,
  enabled: MaybeRef<boolean | undefined> = true,
  options?: TUseQueryOptions
) => {
  return useQuery({
    queryKey: computed(() => ['get-root-destination', unref(documentId)]),
    queryFn: () => getRootDestination(unref(documentId)!),
    enabled: computed(() => !!unref(documentId) && unref(enabled)),
    ...options
  })
}
