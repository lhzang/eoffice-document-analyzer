import type { MutationOptions } from '@/shared/models/common'
import type { DelegateCommand } from '@/shared/services/api'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
type TPayload = {
  id: string
  body: DelegateCommand
}
export const useFowardProcessRole = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.forwardProcessRoleInDoc(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra khi chuyển quyền xử lý văn bản'),
    ...options
  })
