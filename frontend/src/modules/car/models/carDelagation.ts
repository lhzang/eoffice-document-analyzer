import type { TCarType } from './common'

export type TCarAdminAction = 'VIEW' | 'APPROVE_AND_REGISTER' | 'DELETE'
export type TCarGlobalApproveAndRegister =
  | 'APPROVE_STAFF'
  | 'APPROVE_GUEST'
  | 'REGISTER_STUDENT'
  | 'REGISTER_UNIVERSITY'
  | 'REGISTER_COLLABORATOR'
export type TCarPermissionUser = {
  positionId: string
  displayName: string
}

export type TCarConfigViewAndDeletePermissions = {
  permission: {
    label: string
    value: TCarType
  }
  users: TCarPermissionUser[]
}
export type TCarConfigRegisterAndApprovePermissions = {
  permission: {
    label: string
    value: TCarGlobalApproveAndRegister
  }
  users: TCarPermissionUser[]
  hasPermission: boolean
}
