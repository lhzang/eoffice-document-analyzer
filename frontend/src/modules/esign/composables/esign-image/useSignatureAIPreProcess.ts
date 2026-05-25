import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import { esignService } from '../../services/esignImageService'

type TPreviewPayload = {
  file: File
}

export const useSignatureAIPreProcess = (
  options?: MutationOptions<ArrayBuffer, TServerError, TPreviewPayload>
) =>
  useMutation<ArrayBuffer, TServerError, TPreviewPayload>({
    mutationFn: ({ file }) => esignService.processSignatureImage(file),
    onError: (e) => {
      notifyError(e, 'Xử lý ảnh với AI thất bại')
    },
    ...options
  })
