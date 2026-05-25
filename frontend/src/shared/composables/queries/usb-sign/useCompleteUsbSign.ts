import type { MutationOptions } from '@/shared/models/common'
import usbService from '@/shared/services/usb-services/usb.service'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

type TPayload = {
  correlationId: string
  file: File
}

export const useCompleteUsbSign = (options?: MutationOptions<void, TServerError, TPayload>) =>
  useMutation<void, TServerError, TPayload>({
    mutationFn: (payload) => usbService.completeSignUsb(payload.correlationId, payload.file),
    onError: (e) => notifyError(e, 'Có lỗi khi ký USB'),
    ...options
  })
