import { APP_DOCUMENT_TYPES } from '@/shared/constants/document'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { TResponseListData } from '@/shared/models/types'
import { DateTime } from 'luxon'
import { OutDocApi, type Pageable } from '../api'
import { apiClientConfig } from '../apiClientConfig'

const internalDocApi = new OutDocApi(apiClientConfig)

export const sharedInternalDocService = {
  getInternalRelatedDocs: async (
    pageable: Pageable,
    filterPayload: TGetRelatedFilterPayload
  ): Promise<TResponseListData<TResponseRelatedDoc>> => {
    const { search, year, documentTypes } = filterPayload

    const res = await internalDocApi.getRelatedOutDocs(
      pageable,
      search,
      undefined,
      undefined,
      documentTypes,
      undefined,
      year,
      'INTERNAL_DOC'
    )
    const formatedData = res.data.items.map((item) => ({
      id: item?.id,
      documentCode: item?.documentCode,
      subject: item?.subject,
      creatorName: item?.creator?.name,
      documentType: APP_DOCUMENT_TYPES.internalDoc,
      issueDate: item?.issuedDate ? DateTime.fromISO(item?.issuedDate).toFormat('dd/MM/yyyy') : '',
      isInternalOrgIndoc: false
    }))
    return {
      docs: formatedData,
      page: res?.data?.pageNumber,
      pageSize: res?.data?.pageSize,
      pageCount: res?.data?.totalPages,
      docCount: res?.data?.totalItems
    }
  }
}
