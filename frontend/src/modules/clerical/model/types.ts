import type { TDocumentType } from '@/shared/constants/document'

export interface IDocumentBookDataResponse {
  docs: IDocumentBookData[]
  page: number
  pageSize: number
  pageCount: number
  docCount: number
}

export interface IDocumentBookData {
  documentBookId: string
  name: string
  bookCode: string
  bookType: TDocumentType
  documentCount: number
  availableCount: number
  documentTypeIds: string[]
  bookStatus: TBookStatus
  startCount: number
  unitId: string
}

export interface IDocumentType {
  _id: string
  name: string
  shortName: string
  expiredDate: number
  isPlusExpired?: boolean
}
export type TBookStatus = 'Open' | 'Lock'

//payload
export interface IDocumentBookFilterPayload {
  search?: string
  bookType?: TDocumentType[]
  bookStatus?: TBookStatus
  page?: number
  pageSize?: number
}

export interface IDocumentTypeFilterPayload {
  search?: string
  page?: number
  pageSize?: number
}
