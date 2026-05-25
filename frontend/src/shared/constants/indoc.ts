export const INDOC_PROCESS_EVENT_TYPE = {
  DocumentDistributed: 'DOCUMENTDISTRIBUTED',
  DocumentFinished: 'DOCUMENTFINISHED',
  IncomingDocumentRejected: 'INCOMINGDOCUMENTREJECTED',
  IncomingDocumentRevoked: 'INCOMINGDOCUMENTREVOKED',
  InternetDocumentWasRevoked: 'INTERNETDOCUMENTWASREVOKED',
  StaffCommented: 'STAFFCOMMENTED',
  StaffAssigned: 'STAFFASSIGNED',
  StaffFinished: 'STAFFFINISHED',
  StaffRejected: 'STAFFREJECTED',
  StaffViewed: 'STAFFVIEWED',
  StaffRevoked: 'STAFFREVOKED',
  StaffReported: 'STAFFREPORTED',
  StaffDelegated: 'STAFFDELEGATED',
  SecretaryViewed: 'SECRETARYVIEWED',
  StaffWasRevoked: 'STAFFWASREVOKED'
} as const

export type TIndocDocProcessEventType =
  (typeof INDOC_PROCESS_EVENT_TYPE)[keyof typeof INDOC_PROCESS_EVENT_TYPE]

export const INDOC_EVENT_LABEL: Record<TIndocDocProcessEventType, string> = {
  [INDOC_PROCESS_EVENT_TYPE.DocumentDistributed]: 'Đã phân phối xử lý văn bản cho',
  [INDOC_PROCESS_EVENT_TYPE.DocumentFinished]: 'Đã kết thúc văn bản',
  [INDOC_PROCESS_EVENT_TYPE.IncomingDocumentRejected]: 'Đã trả lại văn bản',
  [INDOC_PROCESS_EVENT_TYPE.IncomingDocumentRevoked]: 'Đã thu hồi quyền xử lý văn bản của',
  [INDOC_PROCESS_EVENT_TYPE.StaffCommented]: 'Đã để lại ý kiến',
  [INDOC_PROCESS_EVENT_TYPE.StaffAssigned]: 'Đã chỉ đạo xử lý văn bản cho',
  [INDOC_PROCESS_EVENT_TYPE.StaffFinished]: 'Đã hoàn thành công việc',
  [INDOC_PROCESS_EVENT_TYPE.StaffRejected]: 'Đã trả lại văn bản',
  [INDOC_PROCESS_EVENT_TYPE.StaffViewed]: 'Đã xem',
  [INDOC_PROCESS_EVENT_TYPE.StaffRevoked]: 'Đã thu hồi quyền xử lý văn bản của',
  [INDOC_PROCESS_EVENT_TYPE.StaffReported]: 'Đã báo cáo tiến độ',
  [INDOC_PROCESS_EVENT_TYPE.StaffDelegated]: 'Đã chuyển quyền xử lý văn bản cho',
  [INDOC_PROCESS_EVENT_TYPE.SecretaryViewed]: 'Đã xem',
  [INDOC_PROCESS_EVENT_TYPE.StaffWasRevoked]: 'Đã bị thu hồi',
  [INDOC_PROCESS_EVENT_TYPE.InternetDocumentWasRevoked]: 'Đã bị thu hồi'
} as const

export const INDOC_DOC_STATUS = {
  Created: 'CREATED',
  Registered: 'REGISTERED',
  Proposed: 'PROPOSED',
  Distributed: 'DISTRIBUTED',
  Finished: 'FINISHED',
  Revoked: 'REVOKED',
  Rejected: 'REJECTED',
  Replacement: 'REPLACEMENT',
  Canceled: 'CANCELED',
  Skipped: 'SKIPPED'
} as const

export type TIndocDocStatus = (typeof INDOC_DOC_STATUS)[keyof typeof INDOC_DOC_STATUS]

export const INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY: Record<
  TIndocDocStatus,
  {
    title: string
    icon: string
    color: string
  }
> = {
  [INDOC_DOC_STATUS.Created]: {
    title: 'Chờ tiếp nhận',
    icon: 'icon-[bx--book-add]',
    color: '#9426EE'
  },
  [INDOC_DOC_STATUS.Registered]: {
    title: 'Đã nhập sổ',
    icon: 'icon-[material-symbols--bookmark-added-outline]',
    color: '#9426EE'
  },
  [INDOC_DOC_STATUS.Proposed]: {
    title: 'Đã đề xuất',
    icon: 'icon-[carbon--request-quote]',
    color: '#25314C'
  },
  [INDOC_DOC_STATUS.Distributed]: {
    title: 'Đã phân phối',
    icon: 'icon-[carbon--request-quote]',
    color: '#EE8626'
  },
  [INDOC_DOC_STATUS.Finished]: {
    title: 'Đã kết thúc',
    icon: 'icon-[carbon--request-quote]',
    color: '#00875A'
  },
  [INDOC_DOC_STATUS.Revoked]: {
    title: 'Đã bị thu hồi',
    icon: 'icon-[carbon--request-quote]',
    color: '#7d7d7d'
  },
  [INDOC_DOC_STATUS.Rejected]: {
    title: 'Đã bị trả lại',
    icon: 'icon-[icon-park-outline--reject]',
    color: '#FC0D1B'
  },
  [INDOC_DOC_STATUS.Replacement]: {
    title: 'Đã bị thay thế',
    icon: 'icon-[ix--replace]',
    color: '#7d7d7d'
  },
  [INDOC_DOC_STATUS.Canceled]: {
    title: 'Đã bị hủy',
    icon: 'icon-[material-symbols--cancel-outline]',
    color: '#FC0D1B'
  },
  [INDOC_DOC_STATUS.Skipped]: {
    title: 'Đã bỏ qua',
    icon: 'icon-[octicon--skip-16]',
    color: '#5a5a5aff'
  }
} as const
