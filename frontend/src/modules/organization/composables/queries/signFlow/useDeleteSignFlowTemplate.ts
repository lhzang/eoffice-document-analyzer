import type { MutationOptions } from '@/shared/models/common'
import { signTepmplateService } from '@/shared/services/outdoc/signTemplateService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useDeleteSignFlowTemplate = (options?: MutationOptions<void, TServerError, string>) =>
  useMutation<void, TServerError, string>({
    mutationFn: (id) => signTepmplateService.deleteSignTemplate(id),
    onError: (e) => notifyError(e, 'Xoá mẫu trình tự ký thất bại'),
    ...options
  })
