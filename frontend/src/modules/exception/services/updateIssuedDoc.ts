import { OutDocApi, type UpdateAnnexesRequest } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TGetExceptionHistoryPayload } from '../models/exceptionHistory'
import type {
  TCancelIssuedDocPayload,
  TGetListExceptionDocPayload,
  TReplaceMainFilePayload,
  TUpdateAnnexesPayload,
  TUpdateIssuedDatePayload
} from '../models/updateIssuedDoc'

const exceptionApi = new OutDocApi(apiClientConfig)
export const exceptionServices = {
  // Lấy danh sách văn bản ngoại lệ
  getExceptionDocument: async (getListPayload: TGetListExceptionDocPayload) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { exceptionType, type, search } = filterPayload
    const res = await exceptionApi.getExceptionDocuments(exceptionType, type, pageble, search)
    return res.data
  },
  // Lấy lịch sử xử lý ngoại lệ
  getExceptionHistory: async (arg1: TGetExceptionHistoryPayload) => {
    const { page, pageSize } = arg1
    const pageble = { page, size: pageSize, sort: [] }
    const res = await exceptionApi.getExceptionHistory(pageble)
    return res.data
  },
  // Cập nhật ngày phát hành văn bản
  updateIssuedDate: async (payload: TUpdateIssuedDatePayload) => {
    const { docId, reason, relatedFile } = payload
    const res = await exceptionApi.updateIssuedDate(docId, reason, relatedFile)
    return res.data
  },
  // Cập nhật phụ lục văn bản
  updateAnnexes: async (payload: TUpdateAnnexesPayload) => {
    const { docId, addAnnexes, relatedFile, removeAnnexes, reason } = payload
    const updateAnnexesRequest: UpdateAnnexesRequest = {
      reason,
      ...(removeAnnexes.length > 0 && { removeAnnexes })
    }
    const res = await exceptionApi.updateAnnexes(
      docId,
      updateAnnexesRequest,
      addAnnexes,
      relatedFile
    )
    return res.data
  },
  // Thay thế file chính văn bản
  replaceMainFile: async (payload: TReplaceMainFilePayload) => {
    const { docId, newMainFile, reason, relatedFile } = payload
    const res = await exceptionApi.replaceMainFile(docId, newMainFile, reason, relatedFile)
    return res.data
  },
  // Hủy phát hành văn bản
  cancelIssuedDocument: async (payload: TCancelIssuedDocPayload) => {
    const { docId, reason, relatedFile } = payload
    const res = await exceptionApi.cancelIssuedDocument(docId, reason, relatedFile)
    return res.data
  }
}
