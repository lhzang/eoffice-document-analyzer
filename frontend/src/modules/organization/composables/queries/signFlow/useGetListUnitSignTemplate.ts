import type { QueryOptions } from '@/shared/models/common'
import type { FlowSignTemplateVM } from '@/shared/services/api'
import { signTepmplateService } from '@/shared/services/outdoc/signTemplateService'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const useGetListUnitSignTemplate = (
  unitId: MaybeRefOrGetter<string>,
  type: 'internal' | 'out',
  options?: QueryOptions<FlowSignTemplateVM[], AxiosError>
) => {
  return useQuery<FlowSignTemplateVM[], AxiosError>({
    queryKey: ['getListUnitSignTemplate'],
    queryFn: () => signTepmplateService.getListUnitSignTemplates(toValue(unitId), type),
    ...options
  })
}
