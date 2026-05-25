import { http, HttpResponse } from 'msw'
import { appConfig } from '@/config/app-config'
import { withAuth } from '@/shared/mocks/middleware'
import { dataListDevice } from './mockData'

let otpCode = ""

export const handlers = [
  http.get(
    `${appConfig.VITE_ESIGN_API_SERVER}/api/sign/p12/devices`,
    withAuth(async () => {      
      return HttpResponse.json(dataListDevice, { status: 200 })
    })
  ),

  http.delete(
    `${appConfig.VITE_ESIGN_API_SERVER}/api/sign/p12/devices`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const registeredId = url.searchParams.get('registeredId')
      const totp = url.searchParams.get('totp')
      const accountId = url.searchParams.get('accountId')
      
      if (!registeredId || !totp || !accountId) {
        return new HttpResponse(null, { status: 400 })
      }

      if (totp !== otpCode) {
        return HttpResponse.json({ message: "OTP không đúng" }, { status: 400 })
      }

      const index = dataListDevice.findIndex(d => d.id === registeredId)
      if (index !== -1) {
        dataListDevice.splice(index, 1)
      }

      return new HttpResponse(null, { status: 204 })
    })
  ),

  http.get(
    `${appConfig.VITE_ESIGN_API_SERVER}/api/otp/send-totp-email`,
    withAuth(async ({ request }) => {
      const url = new URL(request.url)
      const email = url.searchParams.get('email')
      
      if (email) {
        return new HttpResponse(null, { status: 400 })
      }

      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString()
      otpCode = randomOtp

      return HttpResponse.json(randomOtp, { status: 200 })
    })
  )
]
