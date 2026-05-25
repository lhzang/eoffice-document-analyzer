import type { MutationOptions } from '@/shared/models/common'
import type { RegisterKeepNumberCommand } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useCreateRegisterNumOD = (
  options?: MutationOptions<void, TServerError, RegisterKeepNumberCommand>
) =>
  useMutation<void, TServerError, RegisterKeepNumberCommand>({
    mutationFn: (payload) => sharedDocumentBookService.createRegistration(payload),
    onError: (e) => notifyError(e, 'Tạo đăng ký giữ số thất bại'),
    ...options
  })
