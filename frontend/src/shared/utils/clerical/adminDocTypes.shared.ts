import sharedAdminDocumentTypeService from '@/shared/services/clerical/adminDocumentTypeServices'
import { omit } from 'lodash-es'

export const fetchMoreDocumentTypeOptions = async (search: string, page: number) => {
  const response = await sharedAdminDocumentTypeService.getListTypes({
    search,
    page,
    size: 20
  })
  const { docs, page: currentPage, pageCount } = response

  return {
    options: docs.map((doc) => ({ value: doc.id, label: doc.name })),
    hasMore: currentPage < pageCount - 1
  }
}
export const fetchMoreFullDocumentTypeOptions = async (search: string, page: number) => {
  const response = await sharedAdminDocumentTypeService.getListTypes({
    search,
    page,
    size: 20
  })
  const { docs, page: currentPage, pageCount } = response

  return {
    options: docs.map((doc) => ({ value: omit(doc, 'deleted'), label: doc.name })),
    hasMore: currentPage < pageCount - 1
  }
}
