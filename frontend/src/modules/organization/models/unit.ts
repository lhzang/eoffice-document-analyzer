import type {
  UpdateInternalUnitDefaultSigningProviderEnum,
  UpdateInternalUnitXroadEnum
} from '@/shared/services/api'

export type TUnitUpdatePayload = {
  adminUnitId?: string
  parentId?: string
  clericalUnitId?: string
  groupId?: string
  name: string
  abbr: string
  address?: string
  email?: string
  axisOrgId?: string
  phone?: string
  fax?: string
  rank?: number
  xroad?: UpdateInternalUnitXroadEnum
  defaultSigningProvider?: UpdateInternalUnitDefaultSigningProviderEnum
  logo?: File
  headId?: string
  deputyIds: Array<string>
}

export type TUnitCreatePayload = {
  name: string,
  abbr: string, 
  parentId: string, 
  shouldCreateBSign: boolean, 
  address?: string, 
  axisOrgId?: string, 
  phone?: string, 
  email?: string, 
  rank?: number, 
  logo?: File, 
  clericalUnitId?: string, 
  groupId?: string
}
