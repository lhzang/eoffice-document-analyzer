import type { TRoleInUnit, TSelectInputType } from '@/shared/constants/common'
import type { TDocumentProcessRole } from '@/shared/constants/document'

export type TStaffDestinationSelect = {
  id: string
  name: string
  systemType: 'INTERNAL'
  type: 'STAFF'
  roleInUnit: TRoleInUnit
}
export type TInUnitDestinationSelect = {
  id: string
  name: string
  systemType: 'INTERNAL'
  type: 'UNIT'
}
export type TExUnitDestinationSelect = {
  id: string
  name: string
  axisOrgId?: string
  systemType: 'EXTERNAL'
  type: 'UNIT'
}

export type TDestinationSelect =
  | TStaffDestinationSelect
  | TInUnitDestinationSelect
  | TExUnitDestinationSelect

export type TFormDestinationProcessRoleInput = {
  type: TSelectInputType
  name: TDocumentProcessRole
}

export type TFormSelectDestinationValue = TDestinationSelect & { formName: TDocumentProcessRole }
export type TFormSelectDestinationValues = Map<string, TFormSelectDestinationValue>
