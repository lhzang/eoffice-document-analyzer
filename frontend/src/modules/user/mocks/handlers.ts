import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'
import type { components } from '@/shared/services/api'
import { http, HttpResponse } from 'msw'
import { mockUserData } from './mockData'

export const handlers = [
  http.get(
    `${appConfig.VITE_API_SERVER}/api/account`,
    withAuth(async () => {
      const response: components['schemas']['StaffInfoDTO'] = mockUserData
      return HttpResponse.json(response, { status: 200 })
    })
  )
]
