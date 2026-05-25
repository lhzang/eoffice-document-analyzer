import type { UpdateExternalUnitCommand } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useUpdateExternalUnit = (options?: {
  onSuccess?: () => void
  onError?: (error: TServerError) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExternalUnitCommand }) =>
      sharedUnitService.updateExternalUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getListExternalUnit'] })
      options?.onSuccess?.()
    },
    onError: options?.onError
  })
}
