import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { TDocumentType, URGENCY_LEVELS } from '@/shared/constants/document'
import type { TDistributeRole } from '@/shared/models/common'
import type { TUrgencyLevelValue } from '@/shared/models/document'
import type { TTreeStaffNode, TTreeUnitNode } from '@/shared/models/organization/unit'
import type {
  DocumentBookDetailVM,
  DocumentDTO,
  Metadata,
  PageListDocumentDTO,
  RegisterInDocRequestPriorityEnum,
  SignerInfo
} from '@/shared/services/api'

export type TCommonIndocFilter = {
  documentTypes?: TCommonSelectOptions<string>[]
  urgentLevels?: TCommonSelectOptions<string>[]
  pageNumber?: number
  pageSize?: number
  search?: string
  startDate?: string
  endDate?: string
}

export type PageListDocumentCreatedDTO = Omit<PageListDocumentDTO, 'content'> & {
  content: TDocumentCreated[]
}

export type TDocumentCreated = DocumentDTO & {
  source?: {
    type: TDocumentType
    docId?: string
  }
}

type TPriorityLevelValue = (typeof URGENCY_LEVELS)[number]['value']

export type TFormSelectDistribute = {
  type: 'radio' | 'checkbox'
  name: TDistributeRole
}

export type TFormSelectUnitDistributeValue = Pick<
  TTreeUnitNode,
  'id' | 'name' | 'shortName' | 'parentUnitId' | 'isGroup' | 'isRoleGroup'
> & {
  formName: TDistributeRole
}

export type TMaybeHasFormNameSelectUnitDistributeValue = Pick<
  TTreeUnitNode,
  'id' | 'name' | 'shortName' | 'parentUnitId' | 'isGroup' | 'isRoleGroup'
> & {
  formName?: TDistributeRole
}

export type TFormSelecStaffDistributeValue = TTreeStaffNode & {
  formName: TDistributeRole
}

export type TFormSelectDistributeItemValue =
  | TFormSelectUnitDistributeValue
  | TFormSelecStaffDistributeValue

export type TDistributeUnitValueNoFormName = Pick<
  TTreeUnitNode,
  'id' | 'name' | 'shortName' | 'parentUnitId' | 'isGroup' | 'isRoleGroup'
>

export type TDistributeStaffValueNoFormName = TTreeStaffNode

export type TDistributedNode = TTreeUnitNode | TTreeStaffNode

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

export type TSigningOption = {
  mustSignMainFile: boolean
  mustSignAnnexes: boolean
  signingProvider?: string
}

export type TCreatePaperInDocParams = {
  mainFile: File
  documentBookId: string
  inOrdinal: number
  unitId: string
  metadata: Metadata
  annexes?: File[]
  signingOption?: TSigningOption
}

export type TCreateIncomingPaperFormData = {
  attachmentFile: File
  documentBook: TCommonSelectOptions<DocumentBookDetailVM>
  inOrdinal: string
  affectedTenant: TCommonSelectOptions<string>
  dueDate?: Date
  priorityLevel: TCommonSelectOptions<TUrgencyLevelValue>
  inDate: Date
  issueDate?: Date
  issueUnit?: { id: string; name: string }
  documentCode: string
  signerName?: string
  signerRole?: string
  description: string
  note?: string
  signAttachment: boolean
  signAppendix: boolean
  appendixFiles?: File[]
  documentType: TCommonSelectOptions<string>
  provider?: string
}

export type TUserSigningConfig = {
  defaultSigningProvider?: string
}

export type TAddInDocToBook = {
  documentBookId: string
  documentType: string
  issuer: string
  inOrdinal: number
  arrivalDate: string
  priority: RegisterInDocRequestPriorityEnum
  subject: string
  signerInfo?: SignerInfo
  issuedDate?: string
  dueDate?: string
  description?: string
  mainFile?: File
  mainFilePath?: string
  annexes?: Array<File>
  annexesPath?: Array<string>
}
