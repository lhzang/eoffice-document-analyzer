import type { IDocumentType } from '@/modules/clerical/model/types'
import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TDocumentType, URGENCY_LEVELS } from '@/shared/constants/document'
import type { TDistributeRole } from '@/shared/models/common'
import type { TUrgencyLevelValue } from '@/shared/models/document'
import type {
  TOutOrg,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode,
  Unit
} from '@/shared/models/organization/unit'
// import { PageListDocumentDTO } from '@/shared/services'
// import type { DocumentDTO } from '@/shared/services/api'

type User = {
  username: string
  fullName: string
  positions: { title: string; unit: string }[]
}

export interface IDataInDocument {
  docs: IInDocumentDetail[]
  page: number
  pageSize: number
  pageCount: number
  docCount: number
}

// type MyType = components["schemas"]["MyType"];
export interface IInDocumentDetail {
  _id: string
  documentTypeId: string
  priorityLevel: TPriorityLevelValue
  shortDescription: string
  documentCode: string
  documentStatus: TDocumentStatus
  issueUnit: IIssueUnit
  arrivalDate: number | string
  attachmentSign: boolean
  appendixSign: boolean
  documentType: IDocumentType
  attachmentFilePath: string
  attachmentFilePdfPath: string
  attachmentSignedURL?: string
  appendixFilePaths?: string[]
  listAppendixSignedURL?: string[]
  inOrdinal?: number
  inDocId: string
  flowId: string
  source: ISource
  note?: string
  signerName?: string
  signerPosition?: string
  effectiveDate?: number
  dueDate?: number
}

export interface IProcedureHistory {
  procedureId: string
  createdAt: number
  inDocId?: string
  procedureType: TProcedureType
}

export interface ICreationHistoryID {
  createdAt: number
  type: TCreationHistoryType
  assignedUsers: IAssignedUsers[]
  actionUser: User & UserInfo
  unit: Unit
  message?: string
}

export interface IRootDestination {
  role: TAssignedUserRoles
  destinations: IDestination[]
}

export interface IDestination {
  type: 'Unit' | 'User' | 'OutOrg'
  unit?: Unit
  outOrg?: TOutOrg
  actionUser?: User
  inDocId: string
  role: TAssignedUserRoles
  status: TDestinationStatus
}

export interface IAssignedUsers {
  functionType: TAssignedUserRoles
  actionUser?: User & UserInfo
  userId?: string
  unitId?: string
  unit?: Unit
}

interface UserInfo {
  userId: string
  phone?: string
  gender?: string
  dob?: string
  degree?: string
}

interface IAppendixFilePaths {
  fileUrl: string
  filePath: string
}

interface IIssueUnit {
  name: string
  type: string
  outOrgId?: string
}

interface ISource {
  type: string
  docId: string
}

export type TPayLoadCompleteManyInDocument = {
  completeIds: string[]
}

export type TUpdateDueDatePayload = {
  dueDate: number
  documentId: string
}

export type TAddDocumentInBookIDFromInternetPayLoad = {
  type: 'eDoc' | 'inDoc'
  documentBookId: string
  documentTypeId: string
  shortDescription: string
  priorityLevel: string
  signerName: string
  signerPosition: string
  arrivalDate?: number
  dueDate?: number
  inOrdinal: number
  effectiveDate?: number
}

//
export type TCreationHistoryType =
  | 'Distribute'
  | 'Create'
  | 'Receive'
  | 'EvaluateDistribute'
  | 'Reject'
  | 'RejectDistribute'
  | 'RequestUpdate'
  | 'Redistribute'
  | 'Update'
  | 'Revoke'
  | 'ProposalDistribute'
  | 'UpdateFlow'
  | 'UpdateByAxis'

export type TDocumentStatus =
  | 'WaitForReceive'
  | 'WaitForSign'
  | 'WaitForApprove'
  | 'UpdateRequired'
  | 'WaitForDistribute'
  | 'Distributed'
  | 'Commanded'
  | 'Recommand'
  | 'Reject'
  | 'Revoke'
  | 'Completed'
  | 'Finish'
  | 'Canceled'
  | 'DistributionRejected'
  | 'Replaced'

export type TProcedureType =
  | 'Distribute'
  | 'EvaluateDistribute'
  | 'Command'
  | 'Devolve'
  | 'Recommand'
  | 'Revoke'
  | 'Report'
  | 'Reject'
  | 'Complete'
  | 'Finish'
  | 'ForceFinish'
  | 'Direct'
  | 'UpdateFlow'
  | 'Read'

export type TAssignedUserRoles = 'Director' | 'Coordinator' | 'Host' | 'Reference'
export type TPriorityLevelValue = (typeof URGENCY_LEVELS)[number]['value']
export type TPriorityLevel = (typeof URGENCY_LEVELS)[number]

export type TDestinationStatus =
  | 'sent'
  | 'rejection'
  | 'acceptance'
  | 'assignment'
  | 'processing'
  | 'finish'
  | 'inbox'
  | 'unknown'
  | 'failure'
  | 'change_acceptance'
  | 'change_rejection'

export type TCommonIndocFilter = {
  documentTypes?: TCommonSelectOptions<string>[]
  urgentLevels?: TCommonSelectOptions<TUrgencyLevelValue>[]
  search?: string
  startDate?: string
  endDate?: string
}

export type PageListDocumentCreatedDTO = Omit<any, 'content'> & {
  content: TDocumentCreated[]
}

export type TDocumentCreated = any & {
  source?: {
    type: TDocumentType
    docId?: string
  }
}

export type TFormSelectDistribute = {
  type: 'radio' | 'checkbox'
  name: TDistributeRole
}

export type TSelectUnitDistributeValue = {
  id: string
  name: string
  type: 'UNIT'
  isGroup: boolean
}

export type TSelectStaffDistributeValue = {
  id: string
  name: string
  type: 'STAFF'
}

export type TFormSelectUnitDistributeValue = {
  id: string
  name: string
  type: 'UNIT'
  isGroup: boolean
  formName: TDistributeRole
}
export type TFormSelecStaffDistributeValue = {
  id: string
  name: string
  type: 'STAFF'
  formName: TDistributeRole
}

export type TFormSelectDistributeItemValue =
  | TFormSelectUnitDistributeValue
  | TFormSelecStaffDistributeValue

export type TDistributeUnitValueNoFormName = Pick<TTreeUnitWithStaffNode, 'id' | 'name' | 'isGroup'>

export type TDistributeStaffValueNoFormName = TTreeStaffNodeNew

export type TDistributeItemValueNoFormName =
  | TDistributeUnitValueNoFormName
  | TDistributeStaffValueNoFormName

export type TFormSelectDistributeItemValues = Map<string, TFormSelectDistributeItemValue>

export type TBodyReportInDoc = {
  message?: string
  files?: File[]
}
export type TBodyFinishProcessDoc = {
  message?: string
  files?: File[]
}
export type TBodyFinishInDoc = {
  message?: string
  files?: File[]
}
export type TBodyReturnID = {
  message?: string
  // files?: File[]
}
export type TBodyReturnAssignedTask = {
  message?: string
  // files?: File[]
}

//delete later
export type TListAbleToDistributeUnit = {
  id: string
  name: string
}

//to process docs
export type TToProcessDocsGetPayload = {
  documentTypes?: string[]
  urgentLevels?: TUrgencyLevelValue[]
  search?: string
  startDate?: string
  endDate?: string
  page: number
  size: number
  sort: string[]
}
export type TGetPendingReceiveInDocPayload = {
  documentTypes?: string[]
  urgentLevels?: TUrgencyLevelValue[]
  search?: string
  startDate?: string
  endDate?: string
  page: number
  size: number
}
export type TIDNeedHandleStatus = 'WAIT_FOR_PROCESSING' | 'PROCESSING' | 'PROCESSED'
export type TEDocReviewTabs = Exclude<TIDNeedHandleStatus, 'PROCESSING'>

export type TIndocCreateHistoryActioName =
  | 'PAPERDOCUMENTCREATED'
  | 'INCOMINGDOCUMENTREGISTERED'
  | 'DOCUMENTPROPOSED'
  | 'INCOMINGDOCUMENTREJECTED'
  | 'PAPERDOCUMENTWASREVOKED'
  | 'INTERNETDOCUMENTWASREVOKED'
  | 'DOCUMENTDISTRIBUTED'
export type TDocumentFromInternetTabs = 'WAIT_FOR_PROCESSING' | 'PROCESSED'

export type TUpdateXroadPayload = {
  docId: string
  metadata: {
    code: string
    issuer: string
    signerInfo?: {
      name?: string
      position?: string
    }
    documentType: string
    arrivalDate: string
    dueDate?: string
    priority: TUrgencyLevelValue
    subject: string
    description?: string
  }
  // mainFile?: File
  mainFilePath: string
  // annexes?: File[]
  annexPaths: string[]
}
