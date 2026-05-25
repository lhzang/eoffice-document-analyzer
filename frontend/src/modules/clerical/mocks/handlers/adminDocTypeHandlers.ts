import { appConfig } from '@/config/app-config'
import { APP_PAGE_SIZE } from '@/shared/constants/common'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post(
    `${appConfig.VITE_API_SERVER}/api/document-type/create`,
    withAuth(async ({ request }) => {
      console.log(request.body, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.put(
    `${appConfig.VITE_API_SERVER}/api/document-type/:id/update`,
    withAuth(async ({ request, params }) => {
      console.log(request.body, params?.id, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 200 })
    })
  ),
  http.delete(
    `${appConfig.VITE_API_SERVER}/api/document-type/:id/delete`,
    withAuth(async ({ request, params }) => {
      console.log(request.body, params?.id, 'MOCKING_DATA')
      return new HttpResponse(null, { status: 404 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/document-type`,
    withAuth(async ({ request, params }) => {
      const url = new URL(request.url)
      const searchParam = url.searchParams
      const size = Number(searchParam.get('size')) ?? APP_PAGE_SIZE
      const page = Number(searchParam.get('page')) ?? 1
      const unpaged = !!searchParam.get('unpaged')
      return new HttpResponse(null, { status: 404 })
    })
  )
]
