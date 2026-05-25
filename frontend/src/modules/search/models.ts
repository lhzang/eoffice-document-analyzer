import type { Pageable, SearchSourceTypeEnum } from '@/shared/services/api'

export type TDocSearchPayload = {
  search?: string
  sourceType?: SearchSourceTypeEnum
  year?: string
  documentNumber?: string
  signer?: string
  creator?: string
  issuingUnit?: string
  fromDate?: string
  toDate?: string
  documentTypeIds?: Array<string>
}
export type TGetDocSearchPayload = TDocSearchPayload & {
  pageable: Pageable
}
