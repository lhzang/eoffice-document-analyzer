import type { TCarStatus } from '../models/common'

export const CAR_TYPES = {
  university: 'UNIVERSITY',
  staff: 'STAFF',
  collaborator: 'COLLABORATOR',
  student: 'STUDENT',
  guest: 'GUEST'
} as const
export const CAR_LIST = [
  {
    label: 'Xe cán bộ',
    value: CAR_TYPES.staff
  },
  {
    label: 'Xe đại học',
    value: CAR_TYPES.university
  },
  {
    label: 'Xe khách',
    value: CAR_TYPES.guest
  },
  {
    label: 'Xe thỉnh giảng/CTV',
    value: CAR_TYPES.collaborator
  },
  {
    label: 'Xe người học',
    value: CAR_TYPES.student
  }
]

export const carRegisterType = {
  STUDENT_UPLOAD: 'STUDENT_UPLOAD',
  STUDENT_MANUAL: 'STUDENT_MANUAL',
  STAFF: 'STAFF',
  COLLABORATOR_UPLOAD: 'COLLABORATOR_UPLOAD',
  COLLABORATOR_MANUAL: 'COLLABORATOR_MANUAL',
  UNIVERSITY_UPLOAD: 'UNIVERSITY_UPLOAD',
  UNIVERSITY_MANUAL: 'UNIVERSITY_MANUAL',
  GUEST: 'GUEST'
} as const

const CAR_REGIST_MODE = {
  manual: 'manual',
  upload: 'upload'
} as const

// const carRegisterPayload = {
//   student: {
//     mode: CAR_REGIST_MODE.manual,
//     payload: TManualRegistStudentCarPayload
//   },

// }

export type TCommonRequestCarFilter = {
  search?: string
  status: TCarStatus[] | null
}
