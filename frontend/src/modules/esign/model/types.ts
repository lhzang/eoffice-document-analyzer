import type { SignatureImageType, TSignatureImageType } from './signatureimg'

export type KeyValueElement = {
  label: string
  value: string | string[]
}[]

export type ApiSignedDoc = {
  _id: string
  timestamp: string | number | Date
  callerName: string
  accountId: string
  state: 'succeed' | 'failed' | string
  originalFile?: {
    fileName?: string
    fileUrl?: string
  }
  result?: {
    fileUrl?: string
  }
}

export type SignedDoc = {
  id: string
  signTime: string
  creator: string
  account: string
  status: string
  fileName: string
  originalFile: string
  signedFile: string
}

export type TApproveSignatureItem = {
  _id: string
  accountId: string
  roles: string[]
  info: {
    name: string
    organization: string
    country: string
    province: string
    locality: string
    email: string
    phone?: string
    unit?: string
  }
} & SignatureImageType

export type TProcessApproveRequesPayload =
  | {
      accountId: string
      reviewResult: 'accept'
      signatureType: Extract<TSignatureImageType, 'major' | 'minor'>
    }
  | {
      accountId: string
      rejectReason?: string
      reviewResult: 'reject'
      signatureType: Extract<TSignatureImageType, 'major' | 'minor'>
    }
export type TProcessMultipleSignatures = {
  ids: string[]
}
