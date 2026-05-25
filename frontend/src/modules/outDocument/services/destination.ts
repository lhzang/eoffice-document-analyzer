import { OutDocApi, type DestinationDto } from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import { buildUnitForestFromUnitAndStaffList } from '@/shared/utils/organization/unit'

const outDocApi = new OutDocApi(apiClientConfig)

export const outDocDestinationService = {
  getDestinationsTree: async (unitId: string) => {
    const response = await outDocApi.getOutDocumentDestinationTree(unitId)
    return buildUnitForestFromUnitAndStaffList(
      response.data?.units ?? [],
      (response.data?.staffs ?? [])?.map((staff) => ({ ...staff, positionId: staff?.id }))
    )
  },
  addDestinations: async (documentId: string, destinations: DestinationDto[]) => {
    const res = await outDocApi.addDestinations(documentId, destinations)
    return res?.data
  }
}
