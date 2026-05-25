import { APP_DOCUMENT_TYPES } from '@/shared/constants/document'
import type { TGetRelatedFilterPayload, TResponseRelatedDoc } from '@/shared/models/document'
import type { TResponseListData } from '@/shared/models/types'
import { OutDocApi, type Pageable, type PreviewWhenCreateQuery } from '@/shared/services/api'
import { handleBufferResponseError } from '@/shared/utils/common'
import { DateTime } from 'luxon'
import { apiClientConfig } from '../apiClientConfig'

const outDocApi = new OutDocApi(apiClientConfig)

export const sharedOutDocService = {
  previewCreateDoc: async (
    metadataRequest: PreviewWhenCreateQuery,
    file: File,
    signal?: AbortSignal
  ) => {
    try {
      const res = await outDocApi.previewOutDocument(metadataRequest, file, {
        responseType: 'arraybuffer',
        signal
      })
      const _file = new File([res?.data], file?.name || 'file_van-ban.pdf', {
        type: 'application/pdf'
      })
      return _file
    } catch (e) {
      // alert(e instanceof DOMException)
      if (e instanceof Error && e?.name === 'CanceledError') {
        // swallow abort
        return
      }
      handleBufferResponseError(e)
    }
  },
  getODRelatedDocs: async (
    pageable: Pageable,
    filterPayload: TGetRelatedFilterPayload
  ): Promise<TResponseListData<TResponseRelatedDoc>> => {
    const { search, year, documentTypes } = filterPayload
    const res = await outDocApi.getRelatedOutDocs(
      pageable,
      search,
      undefined,
      undefined,
      documentTypes,
      undefined,
      year,
      'OUT_DOC'
    )
    const formatedData = res.data.items.map((item) => ({
      id: item?.id,
      documentCode: item?.documentCode,
      subject: item?.subject,
      creatorName: item?.creator?.name,
      documentType: APP_DOCUMENT_TYPES.outDoc,
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
