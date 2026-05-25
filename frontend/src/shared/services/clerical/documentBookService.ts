import type {
  TDocumentBookPayload,
  TGetRegisterNumberPayload
} from '@/shared/models/clerical/documentBook.shared'
import type { TCommonGetListParams } from '@/shared/models/common'
import { DocumentBookApi, type RegisterKeepNumberCommand } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { mappingServerPaginatedData } from '@/shared/utils/common'

const documentBookApi = new DocumentBookApi(apiClientConfig)

const sharedDocumentBookService = {
  getBooks: async (pagePayload: TCommonGetListParams, filtersPayload: TDocumentBookPayload) => {
    const { page, size, search, sort } = pagePayload

    const result = await documentBookApi.getBooks(
      filtersPayload.unitId,
      filtersPayload.status,
      page,
      size,
      sort,
      filtersPayload.bookTypes,
      search
    )
    return mappingServerPaginatedData(result.data)
  },
  getBook: async (id: string) => {
    const result = await documentBookApi.getBook(id)
    return result.data
  },
  createRegistration: async (payload: RegisterKeepNumberCommand) => {
    const res = await documentBookApi.registerKeepNumber(payload)
    return res.data
  },
  getRegisteredNumber: async (payload: TGetRegisterNumberPayload) => {
    const { unitId, status, documentBookId, search, ...pageable } = payload
    const res = await documentBookApi.getRegisterKeepNumbers(
      pageable,
      unitId,
      search,
      status,
      documentBookId
    )
    return res.data
  },
  cancelRegistration: async (bookId: string, number: number) => {
    const res = await documentBookApi.cancelKeepNumber(bookId, number)
    return res.data
  }
}

export default sharedDocumentBookService
