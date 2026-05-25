import type { CreateExternalUnitCommand } from '@/shared/services/api'
import sharedUnitService from '@/shared/services/organization/unitService'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useAddExternalUnit = (options?: {
  onSuccess?: () => void
  onError?: (error: TServerError) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExternalUnitCommand) => sharedUnitService.createExternalUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getListExternalUnit'] })
      options?.onSuccess?.()
    },
    onError: options?.onError
  })
}
