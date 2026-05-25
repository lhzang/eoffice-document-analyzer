import type { SyncRequestDTO } from '@/shared/services/api'
import { useMutation } from '@tanstack/vue-query'
import { useToast } from 'primevue'
import inDocService from '../../inDocService'

export const useSyncEDoc = () => {
  const toast = useToast()

  return useMutation({
    mutationKey: ['sync-e-document'],
    mutationFn: (payload: SyncRequestDTO) => inDocService.sync(payload),
    onSuccess: () => {
      toast.add({
        severity: 'success',
        summary: 'Thành công',

        detail: 'Đồng bộ văn bản thành công',
        life: 3000
      })
    },
    onError: (error) => {
      console.error('Error', error)
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error.message || 'Đã xảy ra lỗi khi đồng bộ văn bản',
        life: 3000
      })
    }
  })
}
