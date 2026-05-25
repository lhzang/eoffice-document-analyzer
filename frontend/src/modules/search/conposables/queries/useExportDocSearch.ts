import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type { TDocSearchPayload } from '../../models'
import { docSearchServices } from '../../services'

export const useExportDocSearch = (
  options?: MutationOptions<Blob, TServerError, TDocSearchPayload>
) =>
  useMutation<Blob, TServerError, TDocSearchPayload>({
    mutationFn: (payload) => docSearchServices.exportDocSearch(payload),
    onError: (e) => notifyError(e, 'Xuất excel thất bại'),
    ...options
  })
