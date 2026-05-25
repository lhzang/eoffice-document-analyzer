import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import inDocService from '../../inDocService'
import type { TBodyReportInDoc } from '../../models/types'

type TPayload = {
  id: string
  body: TBodyReportInDoc
}

export const useReportInDoc = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: ({ id, body }) => inDocService.reportIndoc(id, body),
    onError: (e) => notifyError(e, 'Đã có lỗi xảy ra trong quá trình báo cáo'),
    ...options
  })
