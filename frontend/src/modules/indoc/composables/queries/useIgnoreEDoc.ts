import type { EdocTitle } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import { useToast } from 'primevue'
import inDocService from '../../inDocService'

export const useIgnoreEDoc = () => {
  const toast = useToast()

  return useMutation({
    mutationKey: ['ignore-e-document'],
    mutationFn: (payload: EdocTitle) => inDocService.ignore(payload),
    onSuccess: () => {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Bỏ qua văn bản thành công',
        life: 3000
      })
    },
    onError: (error) => {
      console.error('Error', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error.message || 'Đã xảy ra lỗi khi bỏ qua văn bản',
        life: 3000
      })
    }
  })
}
