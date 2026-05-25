import type {
  GetExceptionDocumentsExceptionTypeEnum,
  GetExceptionDocumentsTypeEnum
} from '@/shared/services/api'

export type TExceptionDocuments =
  (typeof GetExceptionDocumentsExceptionTypeEnum)[keyof typeof GetExceptionDocumentsExceptionTypeEnum]

export type TTypeDocuments =
  (typeof GetExceptionDocumentsTypeEnum)[keyof typeof GetExceptionDocumentsTypeEnum]

export type TGetListExceptionDocPayload = {
  exceptionType: TExceptionDocuments
  type: TTypeDocuments
  search?: string
  page: number
  pageSize: number
  // sort: string[]
}

export type TCancelIssuedDocPayload = {
  docId: string
  reason: string
  relatedFile?: File
}

export type TReplaceMainFilePayload = {
  docId: string
  newMainFile: File
  relatedFile?: File
  reason: string
}

export type TUpdateIssuedDatePayload = {
  docId: string
  reason: string
  relatedFile?: File
}

export type TUpdateAnnexesPayload = {
  docId: string
  addAnnexes?: Array<File>
  relatedFile?: File
  removeAnnexes: string[]
  reason: string
}
