import type { QueryOptions } from '@/shared/models/common'
import type { TUsbAlias } from '@/shared/models/usb.types'
import usbService from '@/shared/services/usb-services/usb.service'
import { useQuery } from '@tanstack/vue-query'

export const useGetUSBAlliases = (options?: QueryOptions<TUsbAlias[], TServerError>) => {
  return useQuery<TUsbAlias[], TServerError>({
    queryKey: ['getUsbAliases'],
    queryFn: () => usbService.getUSBAliases(),
    ...options
  })
}
