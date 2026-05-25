import {
  UrgentLevelsEnum,
  type TDocumentProcessRole,
  type TDocumentType
} from './../constants/document'
export type TDocumentRelatedPreview = {
  filePath: string
}
export type TDocumentPreview = {
  documentCode?: string
  isDocumentFinished?: boolean
  originalFileUrl: string
  nonStampFileUrl: string
  listAppendixFiles: TDocumentRelatedPreview[]
  relatedInDocuments: TDocumentRelatedPreview[]
  relatedInternalDocuments: TDocumentRelatedPreview[]
  relatedInternalStampDocuments: TDocumentRelatedPreview[]
  relatedOutDocuments: TDocumentRelatedPreview[]
  attachmentFilePath: string
}

export type TDocumentFileType = 'pdf' | 'docx'

export type TDocumentSignTypeOpt = {
  value: string
  title: string
  description: string
  emptyContent?: string
}

export type TDocumentTypeItem = {
  label: string
  value: TDocumentType
}
export type TUrgencyLevelValue = (typeof UrgentLevelsEnum)[keyof typeof UrgentLevelsEnum]

export type TDocumentProcessValue = {
  subjectName: string
  action: TDocumentProcessRole
}
export type TGetRelatedFilterPayload = {
  search?: string
  documentTypes?: string[]
  year?: number
}

export type TResponseRelatedDoc = {
  id: string
  documentCode: string
  subject: string
  creatorName: string
  issueDate?: string
  documentType: TDocumentType
  isInternalOrgIndoc: boolean
}
export type TReferenceSource = 'fromDoc' | 'fromTask' | 'upload'

export type AppFile = TDocFiles | TTaskFiles | TDeviceFiles

export type TDocFiles = { type: 'fromDoc'; id: string; name: string; docType: TDocumentType }
export type TTaskFiles = { type: 'fromTask'; id: string; name: string }
export type TDeviceFiles = { type: 'upload'; file: File }

export type FilesBySource = {
  fromDoc: TDocFiles[]
  fromTask: TTaskFiles[]
  upload: TDeviceFiles[]
}
