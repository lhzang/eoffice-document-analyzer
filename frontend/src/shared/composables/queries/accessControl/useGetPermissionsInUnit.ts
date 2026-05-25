import { useQuery } from '@tanstack/vue-query'
import { omit } from 'lodash-es'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { QueryOptions } from '@/shared/models/common'
import acccessControllService from '@/shared/services/accesscontrol/accessControlService'

export const useGetPermissionsInUnit = (
  id: MaybeRefOrGetter<string>,
  options?: QueryOptions<string[], TServerError>
) => {
  return useQuery<string[], TServerError>({
    queryKey: ['getPermissionsInUnit', id],
    queryFn: () => acccessControllService.getPermissionsInUnit(toValue(id)),
    ...omit(options, 'queryKey')
  })
}
