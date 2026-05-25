import type { TAppTab } from '../models/common'
import type { TDocumentTypeItem, TReferenceSource } from '../models/document'

export const FALLBACK_DOC_FILE_NAME = 'file-văn bản'
export const PDF_FILE_TYPE = 'application/pdf'
export const IMG_FILE_TYPE = 'image/png, image/jpg'
export const EXCEL_FILE_TYPE =
  '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const DOCX_FILE_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const PDF_EXTENSION = '.pdf'
export const DOCX_EXTENSION = '.docx'

export const UrgentLevelsEnum = {
  Normal: 'NORMAL',
  Urgent: 'URGENT',
  HighlyUrgent: 'HIGHLY_URGENT',
  Emergency: 'EMERGENCY'
} as const
export type TUrgentLevel = (typeof UrgentLevelsEnum)[keyof typeof UrgentLevelsEnum]

export const URGENCY_LEVEL_LABELS: Record<TUrgentLevel, string> = {
  NORMAL: 'Bình thường',
  URGENT: 'Khẩn',
  HIGHLY_URGENT: 'Thượng khẩn',
  EMERGENCY: 'Hoả tốc'
}

export const URGENCY_LEVELS = [
  {
    value: UrgentLevelsEnum.Normal,
    title: 'Bình thường',
    color: '#3772FF'
  },
  {
    value: UrgentLevelsEnum.Urgent,
    title: 'Khẩn',
    color: '#EB2F96'
  },
  {
    value: UrgentLevelsEnum.HighlyUrgent,
    title: 'Thượng khẩn',
    color: '#F5222D'
  },
  {
    value: UrgentLevelsEnum.Emergency,
    title: 'Hỏa tốc',
    color: '#CF1322'
  }
] as const

export const DOCUMENT_TYPES = {
  inDoc: 'INCOMING_DOCUMENT',
  outDoc: 'OUT_DOCUMENT',
  internalDoc: 'INTERNAL_DOCUMENT'
} as const
export const APP_DOCUMENT_TYPES = {
  inDoc: 'INCOMING_DOCUMENT',
  outDoc: 'OUTGOING_DOCUMENT',
  internalDoc: 'INTERNAL_DOCUMENT'
} as const

export type TDocumentTypeForSign = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES]
export type TDocumentType = (typeof APP_DOCUMENT_TYPES)[keyof typeof APP_DOCUMENT_TYPES]

export const DOCUMENT_TYPE_LIST: TDocumentTypeItem[] = [
  {
    label: 'Văn bản đến',
    value: 'INCOMING_DOCUMENT' as TDocumentType
  },
  {
    label: 'Văn bản đi',
    value: 'OUTGOING_DOCUMENT' as TDocumentType
  },
  {
    label: 'Văn bản nội bộ',
    value: 'INTERNAL_DOCUMENT' as TDocumentType
  }
] as const

export const DOCUMENT_TYPE = {
  inDoc: {
    label: 'Văn bản đến',
    value: 'INCOMING_DOCUMENT' as TDocumentType
  },
  outDoc: {
    label: 'Văn bản đi',
    value: 'OUTGOING_DOCUMENT' as TDocumentType
  },
  internalDoc: {
    label: 'Văn bản nội bộ',
    value: 'INTERNAL_DOCUMENT' as TDocumentType
  }
} as const

export const DOCUMENT_PROCESS_ROLES = {
  Director: 'DIRECTOR',
  Leader: 'LEADER',
  Collaborator: 'COLLABORATOR',
  Viewer: 'VIEWER'
} as const
export const DOCUMENT_PROCESS_ROLES_LABELS: Record<TDocumentProcessRole, string> = {
  DIRECTOR: 'Chỉ đạo',
  LEADER: 'Chủ trì',
  COLLABORATOR: 'Phối hợp',
  VIEWER: 'Xem để biết'
}

export const DOCUMENT_PROCESS_NUMBER = {
  one: 'ONE',
  many: 'MANY'
} as const

export type TDocumentProcessNumber =
  (typeof DOCUMENT_PROCESS_NUMBER)[keyof typeof DOCUMENT_PROCESS_NUMBER]

export type TDocumentProcessRole =
  (typeof DOCUMENT_PROCESS_ROLES)[keyof typeof DOCUMENT_PROCESS_ROLES]

export type TDocumentProcess = {
  role: TDocumentProcessRole
  type: 'radio' | 'checkbox'
  fullLabel: string
  shortLabel: string
}

export type TFormSelectProcessDoc = {
  type: 'radio' | 'checkbox'
  name: TDocumentProcessRole
}

export const RECEIVER_TYPES = {
  UNIT: 'UNIT',
  STAFF: 'STAFF'
} as const

export type TReceiverType = (typeof RECEIVER_TYPES)[keyof typeof RECEIVER_TYPES]

export const RECEIVER_SYSTEM_TYPES = {
  internal: 'INTERNAL',
  external: 'EXTERNAL'
} as const

export type TReceiverSystemType = (typeof RECEIVER_SYSTEM_TYPES)[keyof typeof RECEIVER_SYSTEM_TYPES]

export const commonReferenceTabs: TAppTab<TReferenceSource>[] = [
  { label: 'Từ văn bản', value: 'fromDoc' },
  { label: 'Từ công việc', value: 'fromTask' },
  { label: 'Tải file', value: 'upload' }
]

export const USB_SIGN_TYPES = {
  visibleWithText: 'VISIBLE_WITH_TEXT',
  visibleWithImage: 'VISIBLE_WITH_IMAGE',
  multiSignVisible: 'MULTI_SIGN_VISIBLE',
  visibleImageAndText: 'VISIBLE_IMAGE_AND_TEXT'
} as const

export type TUsbSignType = (typeof USB_SIGN_TYPES)[keyof typeof USB_SIGN_TYPES]
