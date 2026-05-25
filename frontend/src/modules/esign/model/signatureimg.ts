export type TSignatureImageType = 'originalMinor' | 'originalMajor' | 'major' | 'minor'
export type TSignatureImageState = 'pending' | 'accepted' | 'rejected'
export interface SignatureItem {
  label: string
  state: TSignatureImageState | null
  reason: string | null
  url: string
}

export type SignatureImageType = {
  originalMajorSignatureImage?: { signedURL: string }
  originalMinorSignatureImage?: { signedURL: string }
  majorSignatureImage?: { signedURL: string; state: string | null; rejectReason: string }
  minorSignatureImage?: { signedURL: string; state: string | null; rejectReason: string }
}

export type TSignatureImages = Partial<Record<TSignatureImageType, SignatureItem>>

export type TSignatureImageData = {
  url: string
  file?: File
}

export type TUploadMultipleSignaturesImgPayload = {
  major?: File
  minor?: File
  accountId: string
}

export type TUploadSignatureimageResponseMsg = { content: string; status: 'success' | 'failed' }
