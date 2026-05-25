import { useMutation } from '@tanstack/vue-query'
import { esignService } from '@/modules/esign/services/esignDeviceService'
import type { DeleteDevicePayload } from '../../model/deviceInfo'
import { notifyError } from '@/shared/utils/common'

export const useDeleteDevice = () => {
  return useMutation({
    mutationFn: (payload: DeleteDevicePayload) => esignService.deleteDeviceInfo(payload.deviceId, payload.accountId, payload.totp),
    onError: (error) => {
      notifyError(error, "Xóa thiết bị không thành công")
    },
  })
}
