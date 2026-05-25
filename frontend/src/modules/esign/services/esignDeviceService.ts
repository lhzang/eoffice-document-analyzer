import { DELETE, GET } from '../config/axiosClient'
import type { DeviceListResponse } from '../model/deviceInfo'

export const esignService = {
  getDeviceInfo: (email?: string): Promise<DeviceListResponse> =>
    GET(`/api/sign/p12/devices?accountId=${email}`),

  deleteDeviceInfo: (deviceId: string, accountId: string, totp: string) =>
    DELETE(`/api/sign/p12/devices?registeredId=${deviceId}&totp=${totp}&accountId=${accountId}`),
  getEmailTotp: (email: string): Promise<string> => GET(`/api/otp/send-totp-email?email=${email}`)
}
