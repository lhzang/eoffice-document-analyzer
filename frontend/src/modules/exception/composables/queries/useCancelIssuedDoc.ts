import type { MutationOptions } from '@/shared/models/common'
import { useMutation } from '@tanstack/vue-query'
import type { TCancelIssuedDocPayload } from '../../models/updateIssuedDoc'
import { exceptionServices } from '../../services/updateIssuedDoc'
import { notifyError } from '@/shared/utils/common'

export const useCancelIssuedDocument =
  (option?: MutationOptions<void, TCancelIssuedDocPayload, TServerError>) =>
    useMutation({
      mutationFn: (payload) => exceptionServices.cancelIssuedDocument(payload),
      onError: (e) => notifyError(e, 'Hủy văn bản đã phát hành thất bại'),
      ...option
    })