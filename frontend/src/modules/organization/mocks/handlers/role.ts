import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'
import { http, HttpResponse } from 'msw'
import { listRolesRes } from '../data/role'

const roleHandlers = [
  http.get(
    `${appConfig.VITE_API_SERVER}/api/getRoles`,
    withAuth(async ({ request, params }) => {
      return HttpResponse.json(listRolesRes, { status: 200 })
    })
  )
]
export default roleHandlers
