import { useMutation } from '@tanstack/vue-query'
import { useToast } from 'primevue'
import type { TUpdateDueDatePayload } from '../../models/types'
import { updateDueDateInDocument } from '../../services/updateDueDateInDocument'

export const useUpdateDueDate = () => {
  const toast = useToast()
  return useMutation({
    mutationKey: ['update-due-date-in-document'],
    mutationFn: (payload: TUpdateDueDatePayload) => updateDueDateInDocument(payload),
    onSuccess: () => {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật hạn trả lời thành công',
        life: 3000
      })
    },
    onError: (error) => {
      console.error('Error', error)
    }
  })
}
