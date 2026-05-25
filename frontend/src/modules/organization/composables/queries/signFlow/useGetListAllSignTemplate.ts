import type { QueryOptions } from '@/shared/models/common'
import type { FlowSignTemplateVM } from '@/shared/services/api'
import { signTepmplateService } from '@/shared/services/outdoc/signTemplateService'
import { useQuery } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

export const useGetListAllSignTemplate = (
  options?: QueryOptions<FlowSignTemplateVM[], AxiosError>
) => {
  return useQuery<FlowSignTemplateVM[], AxiosError>({
    queryKey: ['getListAllSignTemplate'],
    queryFn: () => signTepmplateService.getListAllSignTemplates(),
    ...options
  })
}
