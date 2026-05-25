import type {
  RegisterGuestCarRequest,
  RegisterUniversityCarRequest
} from '@/shared/services/api'
import type { carRegisterType } from '../constants/carType'

export type TCarRegisterType =
  | 'STUDENT_UPLOAD'
  | 'STUDENT_MANUAL'
  | 'STAFF'
  | 'COLLABORATOR_UPLOAD'
  | 'COLLABORATOR_MANUAL'
  | 'UNIVERSITY_UPLOAD'
  | 'UNIVERSITY_MANUAL'
  | 'GUEST'

export type TCarRegisterPayload<T extends TCarRegisterType> = {
  type: T
  payload: TCarRegisterPayloadMap[T]
}

export type TCarRegistMode = 'manual' | 'upload'
//student
export type TManualRegistStudentCarPayload = {
  graduationDate: string
  eTag: string
  ownerName: string
  licensePlate: string
  registrationFile: File
  studentName?: string
  studentCode?: string
  intakeCode?: string
  className?: string
  admissionYear?: string
  email?: string
}
export type TUploadRegistStudentCarPayload = {
  file: File
}
//staff
export type TRegistStaffCarPayload = {
  licensePlate: string
  eTag: string
  registrationFile: File
}
//guest

export type TRegistGuestCarPayload = RegisterGuestCarRequest
//uni
export type TUploadRegistUniCarPayload = {
  file: File
}

export type TManualRegistUniCarPayload = RegisterUniversityCarRequest

//collaborator
export type TManualRegistCollaboratorPayload = {
  ownerName: string
  licensePlate: string
  phoneNumber: string
  eTag: string
  startDate: string
  endDate: string
  registrationFile: File
}

export type TUploadRegistCollaboratorCarPayload = {
  file: File
}

export type TCarRegisterPayloadMap = {
  [carRegisterType.STAFF]: TRegistStaffCarPayload
  [carRegisterType.GUEST]: TRegistGuestCarPayload
  [carRegisterType.STUDENT_UPLOAD]: TUploadRegistStudentCarPayload
  [carRegisterType.STUDENT_MANUAL]: TManualRegistStudentCarPayload
  [carRegisterType.COLLABORATOR_UPLOAD]: TUploadRegistCollaboratorCarPayload
  [carRegisterType.COLLABORATOR_MANUAL]: TManualRegistCollaboratorPayload
  [carRegisterType.UNIVERSITY_UPLOAD]: TUploadRegistUniCarPayload
  [carRegisterType.UNIVERSITY_MANUAL]: TManualRegistUniCarPayload
}
