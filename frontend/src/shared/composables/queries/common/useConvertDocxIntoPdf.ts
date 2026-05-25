import type { MutationOptions } from '@/shared/models/common'
import { signatureService } from '@/shared/services/common/signatureService'
import { toastError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TPayload = {
  file: File
  fileName?: string
  signal?: AbortSignal
}

export const useConvertDocxIntoPdf = (
  options?: MutationOptions<File | undefined, TServerError, TPayload>
) =>
  useMutation<File | undefined, TServerError, TPayload>({
    mutationFn: (payload) =>
      signatureService.convertDocxIntoPdf(payload?.file, payload?.fileName, payload?.signal),
    onError: (e) =>
      toastError({
        detail: e instanceof Error ? e?.message : 'Có lỗi xảy ra khi chuyển đổi định dạng file'
      }),
    ...options
  })
