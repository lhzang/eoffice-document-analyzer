import type { TDocumentBookStatus } from '@/modules/clerical/model/documentBookType'
import type { GetBooksBookTypesEnum } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'

export const fetchMoreDocumentBookOptions = async (
  search: string,
  page: number,
  unitId: string,
  bookTypes: Array<GetBooksBookTypesEnum>,
  status: TDocumentBookStatus
) => {
  const response = await sharedDocumentBookService.getBooks(
    {
      search,
      page,
      size: 20
    },
    {
      status: status,
      unitId,
      bookTypes
    }
  )
  const { docs, page: currentPage, pageCount } = response

  return {
    options: docs.map((doc) => ({ value: doc.id, label: doc.name })),
    hasMore: currentPage < pageCount - 1
  }
}
