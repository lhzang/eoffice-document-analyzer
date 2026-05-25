import { appConfig } from '@/config/app-config'
import { DOCUMENT_BOOK_STATUS } from '@/shared/constants/clerical/documentBook.shared'
import { APP_PAGE_SIZE } from '@/shared/constants/common'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'
import type { TDocumentBookStatus } from '../../model/documentBookType'
import { genMockDocumentBookData } from '../data/documentBooks'

export const handlers = [
  http.post(
    `${appConfig.VITE_API_SERVER}/api/document-book/create`,
    withAuth(async ({ request }) => {
      console.log(request.body, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.put(
    `${appConfig.VITE_API_SERVER}/api/document-book/:id/update`,
    withAuth(async ({ request, params }) => {
      console.log(request.body, params?.id, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.delete(
    `${appConfig.VITE_API_SERVER}/api/document-book/:id/delete`,
    withAuth(async ({ request, params }) => {
      console.log(request.body, params?.id, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 404 })
    })
  ),
  http.patch(
    `${appConfig.VITE_API_SERVER}/api/document-book/:id/lock`,
    withAuth(async ({ request, params }) => {
      console.log(request.body, params?.id, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/document-book`,
    withAuth(async ({ request, params }) => {
      console.log('ádfasdfsdasdaffasdfsadfa234234')
      const url = new URL(request.url)
      const searchParam = url.searchParams
      const size = Number(searchParam.get('size')) ?? APP_PAGE_SIZE
      const page = Number(searchParam.get('page')) ?? 1
      const status =
        (searchParam.get('bookStatus') as TDocumentBookStatus) ?? DOCUMENT_BOOK_STATUS.OPEN
      console.log(
        request.body,
        params?.id,
        genMockDocumentBookData(page, size, status),
        'MOCKING_DATA'
      )
      return HttpResponse.json(genMockDocumentBookData(page, size, status), { status: 200 })
    })
  )
]
