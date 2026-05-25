import type { TUrgencyLevelValue } from '@/shared/models/document'
import type {
  DocumentMetadataRequest,
  ProcessingStepDto,
  RelatedFileRequest
} from '@/shared/services/api'

export type TWaitForProcessStatusValue = 'WAITING_PROCESSING' | 'PROCESSED'
export type TGetListInternalDocPayload = {
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
export type TDeleteRejectedPayload = {
  id: string
  message: string
}

export type TRegisterInternalDoc = {
  haveCreatorSign: boolean
  mainFile: File
  notation: string
  processingSteps: ProcessingStepDto
  annexes?: Array<File>
  destinations?: string
  relatedFileRequests?: RelatedFileRequest[]
  relatedUploadFiles?: Array<File>
  metadataRequest: DocumentMetadataRequest
}

export type TReRegisterInternalDoc = {
  documentId: string
} & TRegisterInternalDoc
