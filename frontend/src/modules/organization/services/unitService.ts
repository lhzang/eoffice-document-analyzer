import type { TGetStaffInUnitParams } from '@/shared/models/organization/unit'
import { UnitApi } from '@/shared/services/api/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import type { TUnitCreatePayload, TUnitUpdatePayload } from '../models/unit'

const unitControllerApi = new UnitApi(apiClientConfig)

const unitService = {
  async getStaffInUnit(payload: TGetStaffInUnitParams) {
    const { unitId, restricted, permission, page, size, sort } = payload
    const result = await unitControllerApi.getStaffInUnit(
      unitId,
      restricted,
      permission,
      page,
      size,
      sort
      // roleId
    )
    return result.data
  },

  async deleteUnit(unitId: string) {
    const result = await unitControllerApi.deleteUnit(unitId)
    return result.data
  },

  async updateUnit(id: string, payload: TUnitUpdatePayload) {
    const {
      adminUnitId,
      parentId,
      clericalUnitId,
      groupId,
      name,
      abbr,
      address,
      email,
      axisOrgId,
      phone,
      fax,
      rank,
      xroad,
      defaultSigningProvider,
      logo,
      headId,
      deputyIds
    } = payload
    const result = await unitControllerApi.updateInternalUnit(
      id,
      name,
      abbr,
      deputyIds,
      adminUnitId,
      parentId,
      clericalUnitId,
      groupId,
      address,
      email,
      axisOrgId,
      phone,
      fax,
      logo,
      rank,
      xroad,
      defaultSigningProvider,
      headId
    )
    return result.data
  },

  async createInternalChildUnit(payload: TUnitCreatePayload) {
    const {
      name,
      abbr,
      parentId,
      shouldCreateBSign,
      address,
      axisOrgId,
      phone,
      email,
      rank,
      logo,
      clericalUnitId,
      groupId
    } = payload
    const result = await unitControllerApi.createInternalChildUnit(
      name,
      abbr,
      parentId,
      shouldCreateBSign,
      address,
      axisOrgId,
      phone,
      email,
      rank,
      logo,
      clericalUnitId,
      groupId
    )
    return result.data
  }
}

export default unitService
