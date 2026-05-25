import type { TAppFeatureKey } from '@/shared/constants/permission'
import type { TStaffLeaderFilterMode } from '@/shared/models/common'
import type { TGetStaffInUnitPayload } from '@/shared/models/organization/unit'
import {
  FlowApi,
  UnitApi,
  type CreateExternalUnitCommand,
  type UpdateExternalUnitCommand
} from '@/shared/services/api'
import { apiClientConfig } from '@/shared/services/apiClientConfig'
import {
  buildUnitForestFromUnitAndStaffList,
  formatAdminStaffDataForTreeInput,
  formatAdminUnitDataForForm,
  formatAdminUnitDataForTreeInput
} from '@/shared/utils/organization/unit'

const unitApi = new UnitApi(apiClientConfig)
const flowApi = new FlowApi(apiClientConfig)

export const sharedUnitService = {
  getUsersInUnitNoPaginate: async (unitId: string, permissionFilter?: TAppFeatureKey) => {
    const response = await unitApi.getStaffInUnit(unitId, false, permissionFilter)
    return response.data?.items
  },
  getUserInUnit: async (payload: TGetStaffInUnitPayload) => {
    const { unitId, restricted, permission, page, size, sort } = payload
    const response = await unitApi.getStaffInUnit(unitId, restricted, permission, page, size, sort)
    return response.data
  },
  getTreeInternalUnit: async (rootId?: string, level?: number) => {
    const response = await unitApi.getUnitTree(undefined, rootId, level, false)
    const { units = [], rootUnitStaff = [] } = response.data
    const transformedUnitData = formatAdminUnitDataForTreeInput(response?.data?.units)
    return buildUnitForestFromUnitAndStaffList(transformedUnitData ?? [], [])
  },
  getTreeInternalUnitWithStaffs: async (
    filterLeaderMode?: TStaffLeaderFilterMode,
    permissionFilter?: TAppFeatureKey,
    rootId?: string,
    level?: number,
    rootRelativeLevel?: number,
    rootUnitLevel?: number
  ) => {
    const response = await unitApi.getUnitTree(undefined, rootId, level, true, permissionFilter)
    const transformedUnitData = formatAdminUnitDataForTreeInput(response?.data?.units)
    const transformedStaffData = formatAdminStaffDataForTreeInput(
      response?.data?.rootUnitStaff,
      filterLeaderMode
    )
    return buildUnitForestFromUnitAndStaffList(
      transformedUnitData ?? [],
      transformedStaffData ?? [],
      undefined,
      rootRelativeLevel,
      rootUnitLevel
    )
  },
  getTreeDistributeInternalUnit: async (unitId: string) => {
    const response = await flowApi.getDistributeTree(unitId)
    return buildUnitForestFromUnitAndStaffList(
      response.data?.units ?? [],
      (response.data?.staffs ?? [])?.map((staff) => ({ ...staff, positionId: staff?.id }))
    )
  },
  getTreeAssignInternalUnit: async (unitId: string) => {
    const response = await flowApi.getAssignmentTree(unitId)
    return buildUnitForestFromUnitAndStaffList(
      response.data?.units ?? [],
      (response.data?.staffs ?? [])?.map((staff) => ({ ...staff, positionId: staff?.id }))
    )
  },
  getExternalUnits: async (name?: string, page?: number, size?: number, sort?: Array<string>) => {
    const response = await unitApi.getExternalUnits(name, page, size, sort)
    return response.data
  },
  updateExternalUnit: async (id: string, data: UpdateExternalUnitCommand) => {
    const response = await unitApi.updateExternalUnit(id, data)
    return response.data
  },
  createExternalUnit: async (data: CreateExternalUnitCommand) => {
    const response = await unitApi.createExternalUnit(data)
    return response.data
  },
  getUnitTreeForManagement: async (limit?: number) => {
    const response = await unitApi.getUnitTree('management', undefined, limit, true)
    const { units, rootUnitStaff, groupNoUnits } = response.data
    // Units need detailed mapping for UnitEditForm
    const transformedUnitData = formatAdminUnitDataForForm(units)
    const transformedStaffData = formatAdminStaffDataForTreeInput(rootUnitStaff)

    return buildUnitForestFromUnitAndStaffList(
      transformedUnitData ?? [],
      transformedStaffData ?? [],
      groupNoUnits
    )
  },
  getHasStampUnits: async () => {
    const res = await unitApi.unitsWithStamp()
    return res?.data
  },
  async getUnitInfo(unitId: string) {
    const result = await unitApi.getUnitInfo(unitId)
    return result.data
  }
}

export default sharedUnitService
