// src/modules/record/composables/useCreateRecord.ts
import type { CreateRecordCommand } from '@/shared/services/api'
import { RecordApi } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { useMutation } from '@tanstack/vue-query'

export const useCreateRecord = () => {
  return useMutation({
    mutationFn: async (payload: CreateRecordCommand) => {
      const api = new RecordApi(apiClientConfig)
      const { data } = await api.createRecord(payload)
      return data
    }
  })
}
