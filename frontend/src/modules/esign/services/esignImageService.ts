import { AxiosError } from 'axios'
import { DELETE, GET, POST, PUT } from '../config/axiosClient'
import { SIGNATURE_IMG_TYPES } from '../constants/signatureImage'
import type {
  SignatureImageType,
  TSignatureImages,
  TSignatureImageState,
  TUploadMultipleSignaturesImgPayload,
  TUploadSignatureimageResponseMsg
} from '../model/signatureimg'
import type { UserAccountResponse } from '../model/userAccount'

export const esignService = {
  getUserAccount: (email: string): Promise<UserAccountResponse> =>
    GET(`/api/account/accounts/${email}`, { email: 'lam.doba@hust.edu.vn' }),

  getSignatureUploadGuide: (): Promise<string> =>
    GET(`/api/signature-image/regulations`).then((res) => (res as { data: string }).data),

  getSignatureImage: async (id: string): Promise<TSignatureImages> => {
    const res: SignatureImageType = await GET(`/api/signature-image`, { accountId: id })
    return {
      [SIGNATURE_IMG_TYPES.major]: res?.majorSignatureImage
        ? {
            label: 'Chữ ký chính',
            state: res?.majorSignatureImage?.state as TSignatureImageState,
            reason: res.majorSignatureImage.rejectReason ?? null,
            url: res.majorSignatureImage.signedURL
          }
        : undefined,
      [SIGNATURE_IMG_TYPES.minor]: res?.minorSignatureImage
        ? {
            label: 'Chữ ký nháy',
            state: res?.minorSignatureImage?.state as TSignatureImageState,
            reason: res.minorSignatureImage.rejectReason ?? null,
            url: res.minorSignatureImage.signedURL
          }
        : undefined,
      [SIGNATURE_IMG_TYPES.originalMajor]: res?.originalMajorSignatureImage
        ? {
            label: 'Chữ ký chính (Văn phòng)',
            state: null,
            reason: null,
            url: res.originalMajorSignatureImage.signedURL
          }
        : undefined,
      [SIGNATURE_IMG_TYPES.originalMinor]: res?.originalMinorSignatureImage
        ? {
            label: 'Chữ ký nháy (Văn phòng)',
            state: null,
            reason: null,
            url: res.originalMinorSignatureImage.signedURL
          }
        : undefined
    }
  },
  deleteSignatureImage: (signatureType: 'major' | 'minor') =>
    DELETE(`/api/signature-image?signatureType=${signatureType}&accountId=lam.doba@hust.edu.vn`),

  processSignatureImage: (file: File): Promise<ArrayBuffer> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('image', '110')
    return POST(`https://signature-processor.staging.vmu.bsign.app/process-single`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer',
      isFullPath: true
    })
  },
  uploadMultipleSignatureImages: async (payload: TUploadMultipleSignaturesImgPayload) => {
    try {
      const { major, minor, accountId } = payload
      const formMajorData = new FormData()
      const formMinorData = new FormData()

      if (major) {
        formMajorData.append('signatureImage', major)
        formMajorData.append('signatureType', SIGNATURE_IMG_TYPES.major)
        formMajorData.append('accountId', accountId)
        formMajorData.append('shouldPreprocess', 'false')
      }

      if (minor) {
        formMinorData.append('signatureImage', minor)
        formMinorData.append('signatureType', SIGNATURE_IMG_TYPES.minor)
        formMinorData.append('accountId', accountId)
        formMinorData.append('shouldPreprocess', 'false')
      }

      const requests = []
      if (major)
        requests.push(
          PUT(`/api/signature-image`, formMajorData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        )
      if (minor)
        requests.push(
          PUT(`/api/signature-image`, formMinorData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        )
      let responseMsgs: TUploadSignatureimageResponseMsg[] = []
      const responses = await Promise.allSettled(requests)
      console.log(responses, 'responses')
      if (responses?.every((response) => response?.status === 'rejected')) {
        if (major && minor) throw new AxiosError('Thêm ảnh chữ ký chính và chữ ký nháy thất bại')
        else throw new AxiosError(`Thêm ảnh chữ ký ${major ? 'chính' : 'nháy'} thất bại`)
      } else {
        if (responses?.every((response) => response?.status === 'fulfilled')) {
          if (major && minor)
            return (responseMsgs = [
              { content: 'Thêm ảnh chữ ký chính và chữ ký nháy thành công', status: 'success' }
            ])
          else
            return (responseMsgs = [
              {
                content: `Thêm ảnh chữ ký ${major ? 'chính' : 'nháy'} thành công`,
                status: 'success'
              }
            ])
        } else {
          if (responses?.[0].status === 'fulfilled') {
            return (responseMsgs = [
              { content: 'Thêm ảnh chữ ký chính thành công', status: 'success' },
              { content: 'Thêm ảnh chữ ký nháy thất bại', status: 'failed' }
            ])
          } else
            return (responseMsgs = [
              { content: 'Thêm ảnh chữ ký chính thất bại', status: 'failed' },
              { content: 'Thêm ảnh chữ ký nháy thành công', status: 'success' }
            ])
        }
      }
    } catch (e) {
      throw new AxiosError(
        e instanceof Error
          ? (e?.message ?? 'Có lỗi xảy ra khi cập nhật ảnh chữ ký')
          : 'Có lỗi xảy ra khi cập nhật ảnh chữ ký'
      )
    }
  }
}
