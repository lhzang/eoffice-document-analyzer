import type { MutationOptions } from '@/shared/models/common'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'
import type {
  TUploadMultipleSignaturesImgPayload,
  TUploadSignatureimageResponseMsg
} from '../../model/signatureimg'
import { esignService } from '../../services/esignImageService'

export const useUploadMultipleSignatureImages = (
  options?: MutationOptions<
    TUploadSignatureimageResponseMsg[],
    TServerError,
    TUploadMultipleSignaturesImgPayload
  >
) =>
  useMutation<
    TUploadSignatureimageResponseMsg[],
    TServerError,
    TUploadMultipleSignaturesImgPayload
  >({
    mutationFn: (payload) => esignService.uploadMultipleSignatureImages(payload),
    onError: (e) => {
      notifyError(e, 'Cập nhật ảnh chữ ký thất bại')
    },
    ...options
  })
