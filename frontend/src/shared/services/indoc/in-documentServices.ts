import { APP_DOCUMENT_TYPES } from '@/shared/constants/document'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { TResponseListData } from '@/shared/models/types'
import { GetTraceabilityDetailTypeEnum, InDocApi, type Pageable } from '@/shared/services/api'
import { DateTime } from 'luxon'
import { apiClientConfig } from '../apiClientConfig'

const indocApi = new InDocApi(apiClientConfig)

export const sharedIndocService = {
  getIDRelatedDocs: async (
    pageable: Pageable,
    filterPayload: TGetRelatedFilterPayload
  ): Promise<TResponseListData<TResponseRelatedDoc>> => {
    const res = await indocApi.getRelatedIndoc(filterPayload, pageable)

    const formatedData = res.data.items.map((item) => ({
      id: item?.documentId,
      documentCode: item?.documentCode,
      subject: item?.subject,
      creatorName: item?.issuedUnit,
      documentType: APP_DOCUMENT_TYPES.inDoc,
      issueDate: item?.createDate ? DateTime.fromISO(item?.createDate).toFormat('dd/MM/yyyy') : '',
      isInternalOrgIndoc: item?.sourceTypeDto === 'INDOC' || item?.sourceTypeDto === 'OUTDOC'
    }))
    return {
      docs: formatedData,
      page: res?.data?.pageNumber,
      pageSize: res?.data?.pageSize,
      pageCount: res?.data?.totalPages,
      docCount: res?.data?.totalItems
    }
  },
  getDetailHistoryNode: async (targetId: string, type: GetTraceabilityDetailTypeEnum) => {
    const res = await indocApi.getTraceabilityDetail(targetId, type)
    return res?.data
  }
}
