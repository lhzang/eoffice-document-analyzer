import type { TCommonGetListParams } from '@/shared/models/common'
import {
  DocumentBookApi,
  type CreateDocumentBookCommand,
  type UpdateDocumentBookCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type {
  TGetReportDocumentBookPayload,
  TReportDocumentBookPayload
} from '../model/documentBookType'

const documentBookControllerApi = new DocumentBookApi(apiClientConfig)

const documentBookService = {
  createBook: async (payload: CreateDocumentBookCommand) => {
    const result = await documentBookControllerApi.createBook(payload)
    return result.data
  },
  updateBook: async (id: string, payload?: UpdateDocumentBookCommand, startCount?: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasks: Promise<any>[] = []

    if (payload !== undefined) {
      tasks.push(documentBookControllerApi.updateBook(id, payload))
    }

    if (startCount !== undefined) {
      tasks.push(documentBookControllerApi.updateStartNumber(id, startCount))
    }

    const results = await Promise.all(tasks)

    return results.map((r) => r.data as void)
  },
  deleteBook: async (id: string) => {
    const result = await documentBookControllerApi.deleteBook(id)
    return result.data
  },
  lockBook: async (id: string) => {
    const result = await documentBookControllerApi.lockBook(id)
    return result.data
  },
  unLockBook: async (id: string) => {
    const result = await documentBookControllerApi.unlockBook(id)
    return result.data
  },
  editStartNumber: async (id: string, startNumber: number) => {
    const result = await documentBookControllerApi.updateStartNumber(id, startNumber)
    return result.data
  },
  getListDocInBook: async (id: string, payload: TCommonGetListParams) => {
    const { search, ...pageable } = payload
    const result = await documentBookControllerApi.getDocuments(id, pageable, search)
    return result.data
  },
  reportDocumentBook: async (bookId: string, payload: TGetReportDocumentBookPayload) => {
    const { pageable, documentTypeIds, fromDate, toDate } = payload
    const res = await documentBookControllerApi.getReport(
      bookId,
      pageable,
      documentTypeIds,
      fromDate,
      toDate
    )
    return res?.data
  },
  exportReportDocumentBook: async (bookId: string, payload: TReportDocumentBookPayload) => {
    const { documentTypeIds, fromDate, toDate } = payload
    const res = await documentBookControllerApi.exportReport(
      bookId,
      documentTypeIds,
      fromDate,
      toDate,
      {
        responseType: 'blob'
        // headers: { 'Content-Type': 'blob' }
      }
    )
    return res?.data
  }
}

export default documentBookService
