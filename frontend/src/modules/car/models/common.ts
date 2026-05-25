import type {
  CollaboratorCarDetailVM,
  GuestCarDetailVM,
  Pageable,
  StaffCarDetailVM,
  StudentCarDetailVM,
  UniversityCarDetailVM
} from '@/shared/services/api'
import type { DataTableFilterMetaData } from 'primevue'
import type { CAR_TYPES } from '../constants/carType'

export type TCarType = 'STUDENT' | 'STAFF' | 'COLLABORATOR' | 'UNIVERSITY' | 'GUEST'
export type TCommonCarGetListParam = Pageable

export type TDetailCarPayload<T extends TCarType> = {
  id: string
  type: T
}

export type TDetailCarResponse = {
  [CAR_TYPES.staff]: StaffCarDetailVM
  [CAR_TYPES.guest]: GuestCarDetailVM
  [CAR_TYPES.student]: StudentCarDetailVM
  [CAR_TYPES.collaborator]: CollaboratorCarDetailVM
  [CAR_TYPES.university]: UniversityCarDetailVM
}

export type TRejectCarPayload = {
  id: string
  reason: string
}

export type TCarStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type TRequestAndCreatedFilter = {
  status: DataTableFilterMetaData
}
