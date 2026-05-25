import type { TDocumentBookStatus } from '@/modules/clerical/model/documentBookType'
import type { GetBooksBookTypesEnum } from '@/shared/services/api'
import sharedDocumentBookService from '@/shared/services/clerical/documentBookService'

export const fetchMoreDocumentBookOptions = async (
  search: string,
  page: number,
  unitId: string,
  bookTypes: Array<GetBooksBookTypesEnum>,
  status: TDocumentBookStatus,
  type?: 'num' | 'noNum'
) => {
  const response = await sharedDocumentBookService.getBooks(
    {
      search,
      page,
      size: 20,
      sort: []
    },
    {
      status: status,
      unitId,
      bookTypes
    }
  )
  const { docs, page: currentPage, pageCount } = response

  return {
    options: docs
      .map((doc) => ({
        value: doc,
        label: doc.name
      }))
      .filter((doc) => {
        if (type === 'noNum') return doc?.value?.ordinalType === 'NON_ORDINAL'
        else if (type === 'num') return doc?.value?.ordinalType === 'NORMAL'
        return true
      }),
    hasMore: currentPage < pageCount - 1
  }
}
