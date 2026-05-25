import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'
import {
  mockInternalTreeData,
  mockInternalTreeWithStaffLevel1Data,
  mockOrgClericalData,
  mockSoictData,
  mockUserInUnitData
} from '../data/unit'

const unitHandlers = [
  http.get(
    `${appConfig.VITE_API_SERVER}/api/units/tree`,
    withAuth(async ({ request, params }) => {
      const url = new URL(request.url)
      const searchParam = url.searchParams

      if (searchParam.get('type') === 'FULL')
        return HttpResponse.json(mockInternalTreeData, { status: 200 })
      if (searchParam.get('type') === 'DISTRIBUTED') {
        const rootId = searchParam.get('rootUnitId')
        if (rootId) {
          if (rootId === '66c6ae0e9483a00e8da2c926') {
            return HttpResponse.json(mockOrgClericalData, { status: 200 })
          }
          if (rootId === '66c6ab249483a00e8da2be1a') {
            return HttpResponse.json(mockSoictData, { status: 200 })
          }
          if (rootId === '66c5aab60ac0693aa8e6b7af')
            return HttpResponse.json(mockInternalTreeWithStaffLevel1Data, { status: 200 })
          return HttpResponse.json(null, { status: 200 })
        } else {
          return HttpResponse.json(mockInternalTreeWithStaffLevel1Data, { status: 200 })
        }
      }
      return HttpResponse.json(mockInternalTreeWithStaffLevel1Data, { status: 200 })
    })
  ),
  http.get(
    `${appConfig.VITE_API_SERVER}/api/units/:id/staffs`,
    withAuth(async () => {
      return HttpResponse.json(mockUserInUnitData, { status: 200 })
    })
  )
  // http.get(
  //   `${appConfig.VITE_API_SERVER}/api/units/tree?type=DISTRIBUTED`,
  //   withAuth(async ({ request }) => {
  //     return HttpResponse.json(mockInternalTreeWithStaffData, { status: 200 })
  //   })
  // )
]
export default unitHandlers
