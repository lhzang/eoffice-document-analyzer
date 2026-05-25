import type { MutationOptions } from '@/shared/models/common'
import type { TPreviewOutDocPayload } from '@/shared/models/outDoc/document'
import { sharedOutDocService } from '@/shared/services/outdoc/out-documentServices'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const usePreviewCreateDoc = (
  options?: MutationOptions<File | undefined, TServerError, TPreviewOutDocPayload>
) =>
  useMutation<File | undefined, TServerError, TPreviewOutDocPayload>({
    mutationFn: ({ metadataRequest, file, signal }) =>
      sharedOutDocService.previewCreateDoc(metadataRequest, file, signal),
    onError: (e) => notifyError(e, 'Có lỗi khi xem trước văn bản'),
    ...options
  })
