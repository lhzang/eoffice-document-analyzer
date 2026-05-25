import { appConfig } from '@/config/app-config'
import { APP_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'
import type { DocumentRow } from '@/modules/task/models/fileFromDocType'
import { genMockAdminDocTypeData, indocData } from './mockData'

interface QueryParams {
  page?: string
  size?: string
  search?: string
  documentTypes?: string | string[]
  year?: string
  termId?: string
}

const filterDocuments = (
  documents: DocumentRow[],
  filters: Omit<QueryParams, 'page' | 'size'>
): DocumentRow[] => {
  return documents.filter((doc) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true
      
      switch (key) {
        case 'termId':
          return true 
        case 'search':
          return doc.shortDescription?.toLowerCase().includes(String(value).toLowerCase())
        case 'documentTypes':
          return true
        case 'year':
          const docYear = doc.effectiveDate?.split('/')[2]
          return docYear === String(value)
        default:
          return true
      }
    })
  })
}

const filterByDocumentTypes = (
  documents: DocumentRow[],
  documentTypeIds: string[]
): DocumentRow[] => {
  if (documentTypeIds.length === 0) return documents
  
  return documents.filter((doc) =>
    documentTypeIds.some((id) => String(doc.documentTypeId).includes(id))
  )
}

export const handlers = [
  http.get(
    `${appConfig.VITE_API_SERVER}/api/task/in-documents`,
    withAuth(async ({ request}) => {
      const url = new URL(request.url)
      const query = new URLSearchParams(url.search)

      const payload = Object.fromEntries(query) as QueryParams

      let newData: DocumentRow[] = []
      console.log(payload, 'payloadpayloadpayload')
      
      const page = Number(payload.page) ?? 1
      const pageSize = Number(payload.size) ?? DEFAULT_PAGE_SIZE
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      const { page: _, size: __, ...filters } = payload

      if (Object.keys(filters).length === 0) {
        newData = indocData
      } else {
        newData = filterDocuments(indocData, filters)
      }

      const idsFromQuery = query.getAll('documentTypes')
      const selectedDocTypeIds = idsFromQuery.length > 0
        ? idsFromQuery
        : (payload.documentTypes ? [String(payload.documentTypes)] : [])
      newData = filterByDocumentTypes(newData, selectedDocTypeIds)
      const response = {
        items: newData.slice(startIndex, endIndex),
        pageNumber: page,
        pageSize: pageSize,
        totalPages: Math.ceil(newData.length / pageSize),
        totalItems: newData.length
      }
      
      console.log(response, 'newDatanewDatanewData')
      return HttpResponse.json(response, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/task/document-type`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const searchParam = url.searchParams
      const size = Number(searchParam.get('size')) ?? APP_PAGE_SIZE
      const page = Number(searchParam.get('page')) ?? 1
      const unpaged = !!searchParam.get('unpaged')
      return HttpResponse.json(genMockAdminDocTypeData(page, size, unpaged), { status: 200 })
    })
  )
]
