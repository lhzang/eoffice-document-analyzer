import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'
import { taskProgressData } from './mockData'

export const handlers = [
  http.get(
    `${appConfig.VITE_API_SERVER}/api/task/taskdocuments`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const query = new URLSearchParams(url.search)

      const payload = Object.fromEntries(query)

      let newData: any[] = []
      console.log(payload, 'payloadpayloadpayload')
      const rawPage = Number(payload.page)
      const rawSize = Number(payload.size)
      const page = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 1
      const pageSize = Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 5
      const zeroBasedPage = page > 0 ? page - 1 : 0
      const startIndex = zeroBasedPage * pageSize
      const endIndex = startIndex + pageSize

      delete payload.page
      delete payload.size

      if (Object.keys(payload)?.length === 0) newData = taskProgressData
      else
        newData = taskProgressData.filter((doc) =>
          Object.entries(payload).every(([key, value]) => {
            if (!value || value === '') return true
            if (key === 'termId') return true
            if (key === 'search') {
              const keyword = String(value).trim().toLowerCase()
              const docCode = String(doc?.documentCode || '').toLowerCase()
              return docCode.includes(keyword)
            }
            return true
          })
        )

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
  )
]
