import type { Pageable } from '@/shared/services/api'

type TCommonSelectOptions<T> = {
  label: string
  value: T
}

export interface DocumentRow {
  documentTypeId: string
  documentCode: string
  shortDescription: string
  signerName: string
  effectiveDate: string
  internalCheck: boolean
  attachmentFilePath?: string
  // ...
}

export interface DocumentTypeOption {
  id: string
  name: string
}

export interface DocumentFilter {
  search?: string
  documentTypeIds?: string[]
  year?: number
  receivedAfter?: string
  receivedBefore?: string
  priorityLevels?: string[]
}

export type TCommonDocFilter = {
  search?: string
  receivedAfter?: string
  receivedBefore?: string
  documentTypes?: TCommonSelectOptions<string>[]
  priorityLevels?: TCommonSelectOptions<string>[]
  year?: number
}

export interface IData {
  documentTypeId: string
  documentCode: string // Ký hiệu
  shortDescription: string // Trích yếu
  signerName: string // Người soạn thảo
  effectiveDate: string // Ngày ban hành
  internalCheck: boolean // Kiểm tra Văn bản đến trong nội bộ
  attachmentFilePath: string // Đường dẫn file đính kèm
}

export interface ITaskData {
  documentTypeId: string // ID công việc
  documentCode: string // Tên công việc
  progress: string // Tiến độ
  assignees: string[] // Người thực hiện
  deadline: string // Thời hạn
  creator: string // Người tạo
  attachmentFilePath: string // Đường dẫn file đính kèm
}

export type TGetDocPayload = TCommonDocFilter & {
  termId: string
  pageable: Pageable
}
