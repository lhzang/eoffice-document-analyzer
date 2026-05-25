import type { TRoleInUnit } from '@/shared/constants/common'
import type { PaginatedResultExternalUnitVM } from '@/shared/services/api'

export interface Unit {
  unitId: string
  unitName: string
  shortName: string
  unitType: TUnitType
  address?: string
}
export type TOutOrg = {
  name: string
  outOrgId: string
}

export type TUnitType =
  | 'Label'
  | 'SpecializedUnit'
  | 'ClericalOffice'
  | 'CommunistParty'
  | 'OrgClericalOffice'
  | 'BoardOfTrustees'
  | 'RectorateBoard'
  | 'UnionUnit'
  | 'All'
export type TAddExternalUnit = {
  name: string
  shortName: string
}

export type TExternalUnit = {
  id: string
  name: string
  // shortName: string
  axisOrgId?: string
}

export type TGetListExternalUnitPayload = {
  name?: string
  page: number
  size: number
  sort?: Array<string>
}
export type TGetInfiniteListExternalUnitPayload = {
  pageSize?: number
  name?: string
}

export type TGetListExternalUnitsResponse = PaginatedResultExternalUnitVM

export type TGetInfiniteListExternalUnitsResponse = {
  pages: TGetListExternalUnitsResponse[]
  pageParams: TGetListExternalUnitPayload
}

export type TInternalUnitSelect = {
  level: number
  name: string
  parentUnitId: string | null
  shortName: string
  subUnits: TInternalUnitSelect[]
  unitType: TUnitType
  id: string
}

export type TInternalUnitSelectKeys = keyof TInternalUnitSelect

export type TSelectedInternalUnit = {
  id: string
  name: string
  shortName: string
  parentUnitId: string | null
  subUnits: TInternalUnitSelect[]
  unitType: TUnitType
}

export type TTreeGroupNode = Omit<UnitGroupDTO, 'members'> & {
  relativeLevel: number
  subUnits: TTreeUnitNode[]
}

export type TTreeUnitNode = Omit<UnitDTO, 'staffs' | 'subUnits' | 'subUnitGroups'> & {
  relativeLevel: number
  subUnits: TTreeUnitNode[]
  staffs: TTreeStaffNode[]
  isGroup: boolean
  isRoleGroup?: boolean
  // subUnitGroups: TTreeGroupNode[]
}

export type TTreeStaffNode = Omit<StaffDTO, 'email' | 'groups' | 'id'> & {
  unitId: string
  groupIds?: string[]
  // groupId?: string
  staffId: string
}

export type TGroupWithoutUnitVM = {
  id: string
  name: string
  rank: number
  unitId: string
}

//new data type
export type TUnitVM = {
  id: string
  name: string
  parentUnit: {
    id: string
    name: string
    rank: number
  } | null
  rank: number
  group: {
    id: string
    name: string
    rank: number
  } | null
}

export type TMarkedUnitVM = TUnitVM & { isOriginalUnit: boolean }

export type TRoleAsGroupVM = {
  id: string
  name: string
  rank: number
}

export type TStaffVM = {
  positionId: string
  displayName: string
  parentUnit: {
    id: string
    name: string
    rank: number
  }
  accountId?: string
  rank: number
  roleInUnit: TRoleInUnit
  groups: TRoleAsGroupVM[] //
}

// save value
export type TUnitNodeModel = {
  id: string
  name: string
  parentUnit: {
    id: string
    name: string
  } | null
  subUnits: TUnitNodeModel[]
  staffs: TTreeStaffNodeNew[]
  rank: number
}

export type TUnitWithStaffsModel = TUnitVM & {
  staffs: TTreeStaffNodeNew[]
}
export type TUnitWithStaffsNode = TUnitNodeModel & {
  staffs: TTreeStaffNodeNew[]
}

export type TTreeStaffNodeNew = Omit<TStaffVM, 'groups'> & {
  groupIds?: string[]
  // groupId?: string
}

//include alot original valueto check
export type TTreeUnitWithStaffCheckNode = TUnitWithStaffsModel & {
  relativeLevel: number
  levelFromRoot?: number
  subUnits: TTreeUnitWithStaffCheckNode[]
  isGroup: boolean
  isRoleGroup: boolean
}
//just tree value
export type TTreeUnitWithStaffNode = Omit<TUnitWithStaffsNode, 'subUnits'> & {
  rootNodeId: string
  relativeLevel: number
  levelFromRoot: number
  subUnits: TTreeUnitWithStaffNode[]
  isGroup: boolean
  isRoleGroup: boolean
  containStaff: boolean
}
//

export type TTreeInternalItemNode = TTreeUnitWithStaffNode | TTreeStaffNodeNew

export type TUnitSelectValue = { id: string; name: string }
export type TIssueUnitSelectValue = { id: string; name: string; isOrganization: boolean }
export type TStaffSelectValue = { positionId: string; displayName: string }

export type TInternalStaffAndUnitSelectValue = TUnitSelectValue | TStaffSelectValue
export type TStaffAndUnitSelectTab = 'EXTERNAL_TAB' | 'INTERNAL_TAB' | 'HMUH_EXTERNAL_TAB'

export interface TGetStaffInUnitParams {
  unitId: string
  restricted?: boolean
  permission?: string
  page?: number
  size?: number
  sort?: string[]
  roleId?: string
}
export type TGetStaffInUnitPayload = {
  unitId: string
  restricted?: boolean
  permission?: string
  page?: number
  size?: number
  sort?: string[]
}
