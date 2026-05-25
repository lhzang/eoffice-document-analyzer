import { RecordCategoryApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { useMutation } from '@tanstack/vue-query'

export const usePreviewRecordCategory = () => {
  const profileStore = useUserProfileStore()
  return useMutation({
    mutationFn: async (file: File) => {
      const api = new RecordCategoryApi(apiClientConfig)

      const { data } = await api.previewRecordCategoryByFileUpload(file)
      return data
    }
  })
}
