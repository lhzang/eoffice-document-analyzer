import type { MutationOptions } from '@/shared/models/common'
import type { CreateFlowSignTemplateCommand } from '@/shared/services/api'
import { signTepmplateService } from '@/shared/services/outdoc/signTemplateService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useCreateSignFlowTemplate = (
  options?: MutationOptions<void, TServerError, CreateFlowSignTemplateCommand>
) =>
  useMutation<void, TServerError, CreateFlowSignTemplateCommand>({
    mutationFn: (payload) => signTepmplateService.createSignTemplate(payload),
    onError: (e) => notifyError(e, 'Tạo mới trình tự ký thất bại'),
    ...options
  })
