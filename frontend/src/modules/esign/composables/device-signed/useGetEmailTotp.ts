import { useMutation } from '@tanstack/vue-query'
import { esignService } from '@/modules/esign/services/esignDeviceService'
import { useToast } from 'primevue'
import { APP_NOTI_TIME } from '@/shared/constants/common'
import { notifyError } from '@/shared/utils/common'

export const useSendEmailTotp = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (email: string) => esignService.getEmailTotp(email),
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Đã gửi mã TOTP đến email của bạn",
        life: APP_NOTI_TIME,
      })
    },
    onError: (e) => {
      notifyError(e, "Gửi mã TOTP không thành công")
    },
    networkMode:'always'
  })
}
