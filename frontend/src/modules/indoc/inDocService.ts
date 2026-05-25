import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import {
  GetListDocumentsToProcessStatusEnum,
  InDocApi,
  type AssignCommand,
  type CommentCommand,
  type DelegateCommand,
  type DistributeCommand,
  type InDocRevokeDocumentCommand,
  type ProposeDistributeCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { mappingServerPaginatedData } from '@/shared/utils/common'

import type { TSignInDocPayload } from './composables/queries/useSignInDoc'
import type { TAddInDocToBook, TCreateIncomingPaperFormData } from './models/inDocTypes'
import type {
  TAddDocumentInBookIDFromInternetPayLoad,
  TBodyFinishProcessDoc,
  TBodyReportInDoc,
  TBodyReturnAssignedTask,
  TBodyReturnID,
  TDocumentFromInternetTabs,
  TGetPendingReceiveInDocPayload,
  TToProcessDocsGetPayload,
  TUpdateXroadPayload
} from './models/types'
import { preProcessDataForAddPaperID } from './utils/document'

const inDocApi = new InDocApi(apiClientConfig)

const inDocService = {
  getToProcessInDoc: async (
    filterQuery: TToProcessDocsGetPayload,
    status: GetListDocumentsToProcessStatusEnum
  ) => {
    const { page, size, sort, ...indocFilterParams } = filterQuery
    const pageable = { page, size, sort }
    const response = await inDocApi.getListDocumentsToProcess(indocFilterParams, pageable, status)
    return mappingServerPaginatedData(response.data)
  },
  getBulkDistributeableIndoc: async (filterQuery: TToProcessDocsGetPayload) => {
    const { page, size, sort, ...indocFilterParams } = filterQuery
    const pageable = { page, size, sort }
    const response = await inDocApi.getWaitForDistribute(indocFilterParams, pageable)
    return mappingServerPaginatedData(response.data)
  },
  getInDocDetail: async (id: string) => {
    const response = await inDocApi.getDocumentById(id)
    return response.data
  },

  //old
  addEdocToBook: async (payload: Omit<TAddDocumentInBookIDFromInternetPayLoad, 'type'>) => {
    // const response = await new Promise((resolve) => setTimeout(() => resolve({ data: null }), 1000))
    return
  },

  //in doc
  addInDocToBook: async (payload: Omit<TAddDocumentInBookIDFromInternetPayLoad, 'type'>) => {
    // const response = await new Promise((resolve) => setTimeout(() => resolve({ data: null }), 1000))
    return
  },

  getPendingReceiveInDoc: async (
    filterQuery: TGetPendingReceiveInDocPayload,
    status: TDocumentFromInternetTabs
  ) => {
    const { page, size, ...filterReceive } = filterQuery
    const pageable = { page, size, sort: [] }
    const response = await inDocApi.getWaitForReceive(
      filterReceive,
      status === 'WAIT_FOR_PROCESSING' ? 'WAIT' : 'DONE',
      pageable
    )
    return mappingServerPaginatedData(response.data)
  },

  getDocumentCreated: async (filterQuery: TToProcessDocsGetPayload) => {
    const { page, size, ...filterReceive } = filterQuery
    const pageable = { page, size, sort: [] }
    const response = await inDocApi.getCreatedInDocs(filterReceive, pageable)
    return mappingServerPaginatedData(response.data)
  },

  getDocumentRejected: async (filterQuery: TToProcessDocsGetPayload) => {
    const { page, size, ...filterReceive } = filterQuery
    const pageable = { page, size }
    const response = await inDocApi.getRejectedInDocs(filterReceive, pageable)
    return mappingServerPaginatedData(response.data)
  },
  addPaperIDToBook: async (payload: TCreateIncomingPaperFormData) => {
    const processedData = preProcessDataForAddPaperID(payload)
    const {
      mainFile,
      documentBookId,
      inOrdinal,
      unitId,
      metadata,
      annexes = [],
      signingOption
    } = processedData

    const metadataJson = JSON.stringify(metadata)
    const signingOptionJson = signingOption && JSON.stringify(signingOption)

    const response = await inDocApi.createPaperInDoc(
      documentBookId,
      inOrdinal,
      unitId,
      metadataJson,
      mainFile,
      signingOptionJson || '',
      annexes
    )

    return response.data
  },
  signInDoc: async (payload: TSignInDocPayload) => {
    console.log('🚀 ~ signInDoc: ~ payload:', payload)
    // const result = await inDocApi.signInDoc(payload)
    const result: AxiosResponse<void, any> = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: undefined,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {
              headers: {}
            } as InternalAxiosRequestConfig<any>
          }),
        1000
      )
    )
    return result.data
  },
  addInternalIDIntoBook: async (id: string, body: TAddInDocToBook) => {
    const { mainFile, annexes, ...request } = body
    const result = await inDocApi.registerInDoc(id, request, mainFile, annexes)
    return result.data
  },

  //new
  assignInDoc: async (id: string, body: AssignCommand) => {
    const result = await inDocApi.assignInDoc(id, body)
    return result.data
  },
  forwardProcessRoleInDoc: async (id: string, body: DelegateCommand) => {
    const result = await inDocApi.delegateInDoc(id, body)
    return result.data
  },
  reportIndoc: async (id: string, body: TBodyReportInDoc) => {
    const result = await inDocApi.reportInDoc(id, body?.files, body?.message)
    return result.data
  },
  returnID: async (id: string, body: TBodyReturnID) => {
    const result = await inDocApi.rejectDocument(id, undefined, body?.message)
    return result.data
  },
  returnAsignedTask: async (id: string, body: TBodyReturnAssignedTask) => {
    const result = await inDocApi.rejectAssignee(id, undefined, body?.message)
    return result.data
  },
  distributeID: async (id: string, body: DistributeCommand) => {
    const result = await inDocApi.distributeInDoc(id, body)
    return result.data
  },
  revokeIndoc: async (id: string, body: InDocRevokeDocumentCommand) => {
    const result = await inDocApi.revokeInDocument(id, body)
    return result.data
  },
  commentInDoc: async (id: string, body: CommentCommand) => {
    const result = await inDocApi.commentInDoc(id, body)
    return result.data
  },
  finishDocument: async (id: string, body: TBodyFinishProcessDoc) => {
    const files = body?.files ?? []
    const message = body?.message ?? ''
    const result = await inDocApi.finishInDoc(id, files, message)
    return result.data
  },
  getAvailableActions: async (id: string) => {
    const result = await inDocApi.getActionsByDocId(id)
    return result.data
  },
  proposeIndoc: async (id: string, body: ProposeDistributeCommand) => {
    const result = await inDocApi.proposeInDoc(id, body)
    return result.data
  },
  // revokeIndoc: async (id: string, body: RevokeDocumentCommand) => {
  //   const result = await inDocApi.proposeInDoc(id, body)
  //   return result.data
  // },
  getCreateHistoryIndoc: async (id: string) => {
    const result = await inDocApi.getCreatedHistory(id)
    const data = result.data
    return data.events
  },
  getProcessHistoryIndoc: async (id: string) => {
    const result = await inDocApi.getProcessingHistory(id)
    // console.log(result?.data?.events?.[0])
    return result?.data?.[0]?.events?.[0]
  },
  completeManyInDoc: async (docIds: string[]) => {
    const result = await inDocApi.finishInDocBatch(docIds)
    return result.data
  },
  readDoc: async (docId: string) => {
    const res = await inDocApi.markAsViewed(docId)
    return res?.data
  },
  bulkDistribute: async (ids: string[], distributeCommand: DistributeCommand) => {
    const res = await inDocApi?.distributeBatchInDoc(ids, distributeCommand)
    return res?.data
  },
  getSameSourceDocs: async (id: string) => {
    const res = await inDocApi.getAllDocumentHaveSameOriginDocId(id)
    const data = res?.data ?? []

    const reordered = [
      ...data.filter((item) => item.documentId === id),
      ...data.filter((item) => item.documentId !== id)
    ]

    return reordered
  },
  getTraceInDoc: async (id: string, staffId?: string) => {
    const res = await inDocApi.getTraceabilityTree(id, staffId)
    return res?.data
  },
  getRelevantActors: async (docId: string) => {
    const res = await inDocApi.getAssignedReceivers(docId)
    return res?.data
  },
  skipXroad: async (docId: string, reason?: string) => {
    const res = await inDocApi.skipDocument(docId, reason)
    return res?.data
  },
  updateXroadDoc: async (payload: TUpdateXroadPayload) => {
    const { docId, metadata, mainFilePath, annexPaths } = payload
    const request = {
      mainFilePath,
      annexPaths,
      metadata
    }
    const res = await inDocApi.acceptXroadUpdate(docId, request)
    return res?.data
  },
  rejectUpdateXroad: async (docId: string, reason?: string) => {
    const res = await inDocApi.rejectUpdateFromXRoad(docId, reason)
    return res?.data
  }
}

export default inDocService
