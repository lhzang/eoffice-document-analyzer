import type { TIssueDocStatusValue } from '@/shared/models/outDoc/document'
import {
  OutDocApi,
  type AddRelatedFilesToOutDocumentRequest,
  type CreatorRevokeDocumentCommand,
  type EvaluateDocumentCommand,
  type PreviewWhenIssuedQuery,
  type SecretaryEvaluateDocumentCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type {
  TDeleteRejectedPayload,
  TGetListOutDocPayload,
  TIssueEDocPayload,
  TIssuePaperDocPayload,
  TRegisterEOutDocPayload,
  TRegisterPaperOutDocPayload,
  TSendToDestinationPayload,
  TUpdateDocumentPayload,
  TUpdateIssueDatePayload,
  TWaitForProcessStatusValue
} from '../models/document'

const outDocApi = new OutDocApi(apiClientConfig)
export const outDocServices = {
  getWaitForProcressList: async (
    getListPayload: TGetListOutDocPayload,
    status: TWaitForProcessStatusValue
  ) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await outDocApi.getNeedProcessingDocument(
      pageble,
      status,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      'OUT_DOC'
    )
    return res.data
  },
  getCreatedList: async (getListPayload: TGetListOutDocPayload) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels, isIssued } = filterPayload
    const res = await outDocApi.getCreatedDocuments(
      pageble,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      isIssued,
      'OUT_DOC'
    )
    return res.data
  },
  getRejectedList: async (getListPayload: TGetListOutDocPayload) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await outDocApi.getRejectedDocuments(
      pageble,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      'OUT_DOC'
    )
    return res.data
  },
  getIssueDocList: async (getListPayload: TGetListOutDocPayload, status: TIssueDocStatusValue) => {
    const { page, pageSize, ...filterPayload } = getListPayload
    const pageble = { page, size: pageSize, sort: [] }
    const { search, startDate, endDate, documentTypes = [], urgentLevels } = filterPayload
    const res = await outDocApi.getNumberedDocuments(
      pageble,
      status,
      search,
      startDate,
      endDate,
      documentTypes,
      urgentLevels,
      'OUT_DOC'
    )
    return res.data
  },
  getDetailOutDoc: async (id: string) => {
    const res = await outDocApi.getOutDocumentDetail(id)
    return res.data
  },
  getProcessHistory: async (id: string) => {
    const res = await outDocApi.getOutDocumentProcessHistory(id)
    return res.data
  },
  rejectDocument: async (id: string, reason: string, files: Array<File>) => {
    const res = await outDocApi.rejectOutDocument(id, reason, files)
    return res.data
  },
  //creator
  revokeDocument: async (id: string, payload: CreatorRevokeDocumentCommand) => {
    const res = await outDocApi.creatorRevokeOutDocument(id, payload)
    return res.data
  },
  //after issued
  revokedIssuedDocument: async (id: string, file: File, reason?: string) => {
    const res = await outDocApi.revokeOutDocument(id, file, reason)
    return res.data
  },
  evaluateDocument: async (id: string, payload: EvaluateDocumentCommand) => {
    const res = await outDocApi.evaluateOutDocument(id, payload)
    return res.data
  },
  secretaryEvaluateDocument: async (id: string, payload: SecretaryEvaluateDocumentCommand) => {
    const res = await outDocApi.secretaryEvaluateOutDocument(id, payload)
    return res.data
  },
  registerEOutDoc: async (payload: TRegisterEOutDocPayload) => {
    const {
      haveCreatorSign,
      issuedUnitId,
      metadataRequest,
      processingStepDto,
      mainFile,
      oldDocumentId,
      replaceDocumentId,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      jointUnits,
      destinations
    } = payload
    console.log(payload, 'payload22222')
    const res = await outDocApi.createOutDocument(
      haveCreatorSign,
      issuedUnitId,
      metadataRequest,
      processingStepDto,
      mainFile,
      oldDocumentId,
      replaceDocumentId,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      jointUnits,
      destinations
    )
    return res?.data
  },
  registerPaperOutDoc: async (payload: TRegisterPaperOutDocPayload) => {
    const {
      issueUnitId,
      metadataRequest,
      mainFile,
      processingStepDto,
      oldDocumentId,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    } = payload
    const res = await outDocApi.createPaperOutDocument(
      issueUnitId,
      metadataRequest,
      mainFile,
      processingStepDto,
      oldDocumentId,
      annexes,
      relatedFileRequests,
      relatedUploadFiles,
      destinations
    )
    return res?.data
  },
  issueEDoc: async (payload: TIssueEDocPayload) => {
    const res = await outDocApi.issueOutDocument(
      payload?.documentId,
      payload?.issueOutDocumentCommand
    )
    return res?.data
  },
  issuePaperDoc: async (payload: TIssuePaperDocPayload) => {
    const res = await outDocApi.issuePaperDocument(
      payload?.documentId,
      payload?.issuedPaperOutDocRequest,
      payload?.mainFile,
      payload?.annexes
    )
    return res?.data
  },
  previewIssueDoc: async (payload: PreviewWhenIssuedQuery, fileName: string) => {
    const res = await outDocApi.previewIssuedDocument(payload, { responseType: 'arraybuffer' })
    const _file = new File([res?.data], fileName, {
      type: 'application/pdf'
    })
    return _file
  },
  getAvailableActions: async (id: string) => {
    const res = await outDocApi.getAction(id)
    return res?.data
  },
  addRelatedFiles: async (
    documentId: string,
    addRelatedFilesToOutDocumentRequest?: AddRelatedFilesToOutDocumentRequest
  ) => {
    const res = await outDocApi.addRelatedFilesToOutDocument(
      documentId,
      addRelatedFilesToOutDocumentRequest
    )
    return res?.data
  },
  updateDocument: async (updatePayload: TUpdateDocumentPayload) => {
    const { documentId, mainOriginFile, annexes, relatedFiles, relatedUploadFiles } = updatePayload

    const res = await outDocApi.updateOutDocument(
      documentId,
      mainOriginFile,
      { relatedFiles },
      annexes,
      relatedUploadFiles
    )
    return res?.data
  },
  deleteRejectedDoc: async (id: string) => {
    const res = await outDocApi.deleteRejectedDocument(id)
    return res?.data
  },
  updateIssueDate: async (payload: TUpdateIssueDatePayload) => {
    const { docId, updatePayload } = payload
    const res = await outDocApi.updateIssuedDateInWaitingAssignNumber(docId, updatePayload)
    return res?.data
  },
  sendToDestinations: async (payload: TSendToDestinationPayload) => {
    const { documentId, mainFile, subject, code, issueDate, annexes } = payload
    const res = await outDocApi.sendDocumentToDestinations(
      documentId,
      subject,
      code,
      issueDate,
      mainFile,
      annexes
    )
    return res?.data
  },
  getDestinationProcessHistory: async (documentId: string, destinationId: string) => {
    const res = await outDocApi.getDestinationTraceabilityTree(documentId, destinationId, 'UNIT')
    return res?.data
  }
}
