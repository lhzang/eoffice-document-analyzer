import { RecordCategoryApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useMutation } from '@tanstack/vue-query'

export const useCreateRecordCategoryByFileUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const api = new RecordCategoryApi(apiClientConfig)
      const { data } = await api.createRecordCategoryByFileUpload(file)
      return data
    }
  })
}
