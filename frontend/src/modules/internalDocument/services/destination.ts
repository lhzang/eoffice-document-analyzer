import { OutDocApi, type DestinationDto } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { buildUnitForestFromUnitAndStaffList } from '@/shared/utils/organization/unit'

const internalDocApi = new OutDocApi(apiClientConfig)

export const internalDocDestinationService = {
  getDestinationsTree: async () => {
    const response = await internalDocApi.getOutDocumentDestinationTree(undefined, true)
    return buildUnitForestFromUnitAndStaffList(
      response.data?.units ?? [],
      (response.data?.staffs ?? [])?.map((staff) => ({ ...staff, positionId: staff?.id }))
    )
  },
  addDestinations: async (documentId: string, destinations: DestinationDto[]) => {
    const res = await internalDocApi.addDestinations(documentId, destinations)
    return res?.data
  }
}
