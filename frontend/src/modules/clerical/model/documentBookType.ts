import type { TDocumentType } from '@/shared/constants/document'
import type { Pageable } from '@/shared/services/api'

export type TDocumentBookStatus = 'OPEN' | 'LOCKED'

export type TDocumentBookTypeOption = {
  label: string
  value: TDocumentType
}

export type TReportDocumentBookPayload = {
  documentTypeIds?: Array<string>
  fromDate?: string
  toDate?: string
}

export type TGetReportDocumentBookPayload = TReportDocumentBookPayload & {
  pageable: Pageable
}
