import type { TUrgencyLevelValue } from '@/shared/models/document'
import type { TUnitSelectValue } from '@/shared/models/organization/unit'
import type {
  DestinationDto,
  DetailDocumentVM,
  DocumentCode,
  DocumentMetadataRequest,
  IssuedPaperOutDocRequest,
  IssueOutDocumentRequest,
  JointUnitDto,
  ProcessingStepDto,
  RelatedFileRequest,
  UpdateIssuedDateOfWaitingNumberedDocCommand
} from '@/shared/services/api'

export type TWaitForProcessStatusValue = 'WAITING_PROCESSING' | 'PROCESSED'
export type TGetListOutDocPayload = {
  documentTypes?: string[]
  urgentLevels?: TUrgencyLevelValue[]
  search?: string
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
  isIssued?: boolean
  // sort: string[]
}

export type TJointUnitSelectValue = {
  unit: TUnitSelectValue
  index: number
}

export type TRegisterEOutDocPayload = {
  haveCreatorSign: boolean
  issuedUnitId: string
  metadataRequest: DocumentMetadataRequest
  processingStepDto: ProcessingStepDto
  mainFile: File
  oldDocumentId?: string
  replaceDocumentId?: string
  annexes?: Array<File>
  relatedFileRequests?: RelatedFileRequest[]
  relatedUploadFiles?: Array<File>
  jointUnits?: Array<JointUnitDto>
  destinations?: string
}
export type TRegisterPaperOutDocPayload = {
  issueUnitId: string
  metadataRequest: DocumentMetadataRequest
  mainFile: File
  processingStepDto: ProcessingStepDto
  oldDocumentId?: string
  annexes?: Array<File>
  relatedFileRequests?: RelatedFileRequest[]
  relatedUploadFiles?: Array<File>
  destinations?: Array<DestinationDto>
}

export type TIssueEDocPayload = {
  documentId: string
  issueOutDocumentCommand: IssueOutDocumentRequest
}
export type TIssuePaperDocPayload = {
  documentId: string
  issuedPaperOutDocRequest: IssuedPaperOutDocRequest
  mainFile: File
  annexes: Array<File>
}

export type TReRegisterOutDocProps = {
  isGetDetailSuccess: boolean
  detailOutDoc: DetailDocumentVM
}

export type TUpdateDocumentPayload = {
  documentId: string
  mainOriginFile: File
  annexes: File[]
  relatedFiles: RelatedFileRequest[]
  relatedUploadFiles: File[]
}

export type TDeleteRejectedPayload = {
  id: string
  message: string
}
export type TUpdateIssueDatePayload = {
  docId: string
  updatePayload: UpdateIssuedDateOfWaitingNumberedDocCommand
}

export type TSendToDestinationPayload = {
  documentId: string
  subject?: string
  code?: DocumentCode
  issueDate?: string
  mainFile?: File
  annexes?: Array<File>
}
