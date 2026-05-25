import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'
import type { PreviewWhenCreateQuery } from '@/shared/services/api'
import type { TUrgencyLevelValue } from '../document'
import type { TStaffSelectValue } from '../organization/unit'

export const OUT_DOC_STATUS_VALUES = {
  waitingCreatorSignature: 'WAITING_CREATOR_SIGNATURE',
  draftWithdrawn: 'DRAFT_WITHDRAWN',
  waitingStaffSignature: 'WAITING_STAFF_SIGNATURE',
  waitingUnitLeaderSignature: 'WAITING_UNIT_LEADER_SIGNATURE',
  waitingCoSignature: 'WAITING_CO_SIGNATURE',
  waitingLeaderCoSignature: 'WAITING_LEADER_CO_SIGNATURE',
  waitingApproval: 'WAITING_APPROVAL',
  waitingFormatApproval: 'WAITING_FORMAT_APPROVAL',
  waitingIssuanceSignature: 'WAITING_ISSUANCE_SIGNATURE',
  waitingApprovalSignature: 'WAITING_APPROVAL_SIGNATURE',
  returned: 'RETURNED',
  waitingJointStamp: 'WAITING_JOINT_STAMP',
  waitingNumberAssignment: 'WAITING_NUMBER_ASSIGNMENT',
  waitingToSend: 'WAITING_TO_SEND',
  completed: 'COMPLETED',
  revoked: 'REVOKED',
  canceled: 'CANCELED',
  replaced: 'REPLACED',
  reissued: 'REISSUED'
} as const

export type TDocumentStatus = (typeof OUT_DOC_STATUS_VALUES)[keyof typeof OUT_DOC_STATUS_VALUES]

export const OUT_DOC_STATUS_DISPLAY: Record<
  TDocumentStatus,
  { label: string; color: string; background: string }
> = {
  [OUT_DOC_STATUS_VALUES.waitingCreatorSignature]: {
    label: 'Chờ người tạo ký',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingStaffSignature]: {
    label: 'Chờ cán bộ trong đơn vị ký',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingUnitLeaderSignature]: {
    label: 'Chờ lãnh đạo đơn vị ký',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingCoSignature]: {
    label: 'Chờ cán bộ ký đồng trình',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingLeaderCoSignature]: {
    label: 'Chờ lãnh đạo ký đồng trình',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingApproval]: {
    label: 'Chờ duyệt',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingFormatApproval]: {
    label: 'Chờ duyệt thể thức',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingIssuanceSignature]: {
    label: 'Chờ ký ban hành',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingApprovalSignature]: {
    label: 'Chờ ký duyệt',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingJointStamp]: {
    label: 'Chờ đơn vị ký liên tịch',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingNumberAssignment]: {
    label: 'Chờ cấp số',
    color: '#e17100',
    background: '#fff085'
  },
  [OUT_DOC_STATUS_VALUES.waitingToSend]: {
    label: 'Chờ gửi',
    color: '#e17100',
    background: '#fff085'
  },
  //ok
  [OUT_DOC_STATUS_VALUES.completed]: {
    label: 'Đã kết thúc',
    color: '#00a63e',
    background: '#b9f8cf'
  },
  //revoke
  [OUT_DOC_STATUS_VALUES.draftWithdrawn]: {
    label: 'Người tạo thu hồi',
    color: '#e7000b',
    background: '#ffc9c9'
  },
  [OUT_DOC_STATUS_VALUES.replaced]: {
    label: 'Bị thay thế',
    color: '#e7000b',
    background: '#ffc9c9'
  },
  [OUT_DOC_STATUS_VALUES.reissued]: {
    label: 'Đã trình lại',
    color: '#e7000b',
    background: '#ffc9c9'
  },
  [OUT_DOC_STATUS_VALUES.revoked]: { label: 'Bị thu hồi', color: '#e7000b', background: '#ffc9c9' },

  //reject
  [OUT_DOC_STATUS_VALUES.returned]: {
    label: 'Bị trả lại',
    background: '#020618',
    color: '#fcf9fa'
  },
  [OUT_DOC_STATUS_VALUES.canceled]: { label: 'Đã hủy', background: '#020618', color: '#fcf9fa' }
}

export const OUT_DOC_PROCESS_STEP_VALUES = {
  Created: 'CREATED',
  Signed: 'SIGNED',
  Revoked: 'REVOKED',
  Returned: 'RETURNED',
  Evaluated: 'EVALUATED',
  Stamped: 'STAMPED',
  Issued: 'ISSUED'
} as const

export type TDocumentProcessSteps =
  (typeof OUT_DOC_PROCESS_STEP_VALUES)[keyof typeof OUT_DOC_PROCESS_STEP_VALUES]

export const OUT_DOC_PROCESS_STEP_LABEL: Record<TDocumentProcessSteps, string> = {
  CREATED: 'Đã soạn thảo',
  SIGNED: 'Đã ký',
  REVOKED: 'Đã thu hồi',
  RETURNED: 'Đã trả lại',
  EVALUATED: 'Đã duyệt',
  STAMPED: 'Đã đóng dấu liên tịch',
  ISSUED: 'Đã cấp số'
} as const

export const OUT_DOC_ISSUED_STATUS_VALUES = {
  waitingNumbering: 'WAITING_NUMBERING',
  waitingSending: 'WAITING_SENDING',
  numbered: 'NUMBERED',
  returned: 'RETURNED'
} as const

export type TIssueDocStatusValue =
  (typeof OUT_DOC_ISSUED_STATUS_VALUES)[keyof typeof OUT_DOC_ISSUED_STATUS_VALUES]

export const OUT_DOCUMENT_TYPES = {
  digital: 'OUT_DOCUMENT',
  paper: 'PAPER_OUT_DOCUMENT'
} as const

export type TOutDocumentType = (typeof OUT_DOCUMENT_TYPES)[keyof typeof OUT_DOCUMENT_TYPES]

export const OUT_DOC_PROCESS_TYPES = {
  normal: 'NORMAL',
  joint: 'JOINT',
  replace: 'REPLACEMENT',
  noNum: 'NO_NUMBER',
  english: 'ENGLISH'
} as const
export const OUT_DOC_PROCESS_LABEL: Record<TDocProcessType, string> = {
  NORMAL: 'Văn bản thông thường',
  JOINT: 'Văn bản liên tịch',
  REPLACEMENT: 'Văn bản thay thế',
  NO_NUMBER: 'Văn bản không số hiệu',
  ENGLISH: 'Văn bản tiếng Anh'
} as const

export type TDocProcessType = (typeof OUT_DOC_PROCESS_TYPES)[keyof typeof OUT_DOC_PROCESS_TYPES]

export const OUT_DOC_PROCESS_TYPES_LIST: TCommonSelectOptions<TDocProcessType>[] = Object.entries(
  OUT_DOC_PROCESS_LABEL
).map(([key, value]) => ({
  label: value,
  value: key as TDocProcessType
}))

export type TJoinUnitPayload = {
  index: number
  unitId: string
}

export type TPreviewOutDocPayload = {
  metadataRequest: PreviewWhenCreateQuery
  file: File
  signal?: AbortSignal
}
export type TCommonOutdocFilter = {
  documentTypes?: TCommonSelectOptions<string>[]
  urgentLevels?: TCommonSelectOptions<TUrgencyLevelValue>[]
  search?: string
  startDate?: string
  endDate?: string
}
export type TWithOrderStaffSelectValue = TStaffSelectValue & {
  index: number
}
