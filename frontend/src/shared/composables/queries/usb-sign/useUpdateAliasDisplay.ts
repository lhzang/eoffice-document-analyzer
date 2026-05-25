import type { MutationOptions } from '@/shared/models/common'
import type { TUpdateDisplayAlias } from '@/shared/models/usb.types'
import usbService from '@/shared/services/usb-services/usb.service'
import { notifyError } from '@/shared/utils/common'
import { useMutation } from '@tanstack/vue-query'

export const useUpdateAliasDisplay = (
  options?: MutationOptions<void, TServerError, TUpdateDisplayAlias>
) =>
  useMutation<void, TServerError, TUpdateDisplayAlias>({
    mutationFn: (payload) => usbService.updateUsbDisplayData(payload),
    onError: (e) => notifyError(e, 'Có lỗi khi cập nhật thông tin USB'),
    ...options
  })
