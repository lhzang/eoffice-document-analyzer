import type { TReportDocumentBookPayload } from '@/modules/clerical/model/documentBookType'
import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import documentBookService from '../../../services/documentBookService'

type TPayload = {
  id: string
  payload: TReportDocumentBookPayload
}

export const useExportReportDocumentBook = (
  options?: MutationOptions<Blob, TServerError, TPayload>
) =>
  useMutation<Blob, TServerError, TPayload>({
    mutationFn: ({ id, payload }) => documentBookService.exportReportDocumentBook(id, payload),
    onError: (e) => notifyError(e, 'Xuất dữ liệu in sổ thát bại'),
    ...options
  })
