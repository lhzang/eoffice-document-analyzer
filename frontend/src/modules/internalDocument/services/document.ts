import {
  OutDocApi,
  type AddRelatedFilesToOutDocumentRequest,
  type CreatorRevokeDocumentCommand,
  type EvaluateDocumentCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type {
  TDeleteRejectedPayload,
  TGetListInternalDocPayload,
  TRegisterInternalDoc,
  TReRegisterInternalDoc,
  TWaitForProcessStatusValue
} from '../models/document'

const internalDocApi = new OutDocApi(apiClientConfig)
export const internalDocServices = {
  getWaitForProcressList: async (
    getListPayload: TGetListInternalDocPayload,
    status: TWaitForProcessStatusValue
  ) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await internalDocApi.getNeedProcessingDocument(
      pageble,
      status,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      'INTERNAL_DOC'
    )
    return res.data
  },
  getCreatedList: async (getListPayload: TGetListInternalDocPayload) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, isIssued, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await internalDocApi.getCreatedDocuments(
      pageble,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      isIssued,

      'INTERNAL_DOC'
    )
    return res.data
  },
  getRejectedList: async (getListPayload: TGetListInternalDocPayload) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await internalDocApi.getRejectedDocuments(
      pageble,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      'INTERNAL_DOC'
    )
    return res.data
  },

  getDetailInternalDoc: async (id: string) => {
    const res = await internalDocApi.getOutDocumentDetail(id)
    return res.data
  },
  getProcessHistory: async (id: string) => {
    const res = await internalDocApi.getOutDocumentProcessHistory(id)
    return res.data
  },
  rejectDocument: async (id: string, reason: string, files: Array<File>) => {
    const res = await internalDocApi.rejectOutDocument(id, reason, files)
    return res.data
  },
  //creator
  revokeDocument: async (id: string, payload: CreatorRevokeDocumentCommand) => {
    const res = await internalDocApi.creatorRevokeOutDocument(id, payload)
    return res.data
  },
  evaluateDocument: async (id: string, payload: EvaluateDocumentCommand) => {
    const res = await internalDocApi.evaluateOutDocument(id, payload)
    return res.data
  },
  secretaryEvaluateDocument: async (id: string, payload: EvaluateDocumentCommand) => {
    const res = await internalDocApi.secretaryEvaluateOutDocument(id, payload)
    return res.data
  },
  registerInternalDoc: async (payload: TRegisterInternalDoc) => {
    const {
      haveCreatorSign,
      metadataRequest,
      processingSteps,
      mainFile,
      notation,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    } = payload
    const res = await internalDocApi.createInternalDocument(
      haveCreatorSign,
      metadataRequest,
      mainFile,
      processingSteps,
      notation,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    )
    return res?.data
  },
  getAvailableActions: async (id: string) => {
    const res = await internalDocApi.getAction(id)
    return res?.data
  },
  addRelatedFiles: async (
    documentId: string,
    addRelatedFilesToOutDocumentRequest?: AddRelatedFilesToOutDocumentRequest
  ) => {
    const res = await internalDocApi.addRelatedFilesToOutDocument(
      documentId,
      addRelatedFilesToOutDocumentRequest
    )
    return res?.data
  },
  deleteRejectedDoc: async (id: string) => {
    const res = await internalDocApi.deleteRejectedDocument(id)
    return res?.data
  },
  reRegisterInternalDoc: async (payload: TReRegisterInternalDoc) => {
    const {
      documentId,
      haveCreatorSign,
      metadataRequest,
      processingSteps,
      mainFile,
      notation,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    } = payload
    const response = await internalDocApi.recreateOutDocument(
      documentId,
      haveCreatorSign,
      metadataRequest,
      mainFile,
      processingSteps,
      // notation,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    )
  }
}
