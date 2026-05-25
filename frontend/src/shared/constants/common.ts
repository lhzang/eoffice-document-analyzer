export const APP_NOTI_TIME = 2000
export const DEFAULT_PAGE_SIZE = 10

// validation message
export const APP_TEXTAREA_LIMIT = 150
export const APP_TEXTAREA_ROW = 3
export const APP_PAGE_SIZE = 20

export const APP_TEXTAREA_LARGE_ROW = 4
export const APP_TEXTAREA_EXTRA_LARGE_ROW = 8

export const DEFAULT_RANK = 100

export const APP_STATUS_ERROR = {
  BAD_REQUEST: {
    code: 400,
    fallbackMessage: 'Bad Request'
  },
  UNAUTHORIZED: {
    code: 401,
    fallbackMessage: 'Unauthorized'
  },
  FORBIDDEN: {
    code: 403,
    fallbackMessage: 'Forbidden'
  },
  NOT_FOUND: {
    code: 404,
    fallbackMessage: 'Not Found'
  },
  REQUEST_TIMEOUT: {
    code: 408,
    fallbackMessage: 'Request Timeout'
  },
  INTERNAL_ERROR: {
    code: 500,
    fallbackMessage: 'Internal Server Error'
  },
  BAD_GATEWAY: {
    code: 502,
    fallbackMessage: 'Bad Gateway'
  }
} as const

export const GENDER_VALUES = {
  male: 'MALE',
  female: 'FEMALE',
  unknown: 'UNKNOWN'
} as const

export const GENDER_OPTIONS = [
  { label: 'Nam', value: GENDER_VALUES.male },
  { label: 'Nữ', value: GENDER_VALUES.female },
  { label: 'Khác', value: GENDER_VALUES.unknown }
]

export const APP_SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc'
} as const

export const DEGREES = [
  {
    label: 'Giáo sư',
    value: 'Giáo sư'
  },
  {
    label: 'Phó giáo sư',
    value: 'Phó giáo sư'
  },
  {
    label: 'Tiến sĩ',
    value: 'Tiến sĩ'
  },
  {
    label: 'Thạc sĩ',
    value: 'Thạc sĩ'
  },
  {
    label: 'Cử nhân',
    value: 'Cử nhân'
  },
  {
    label: 'Kỹ sư',
    value: 'Kỹ sư'
  }
]

export const SELECT_INPUT_TYPE = {
  radio: 'radio',
  checkbox: 'checkbox'
} as const
export type TSelectInputType = (typeof SELECT_INPUT_TYPE)[keyof typeof SELECT_INPUT_TYPE]

export const ROLE_IN_UNIT_VALUES = {
  director: 'DIRECTOR',
  unitHead: 'UNIT_HEAD',
  unitDeputy: 'UNIT_DEPUTY',
  admin: 'ADMIN',
  custom: 'CUSTOM'
} as const

export type TRoleInUnit = (typeof ROLE_IN_UNIT_VALUES)[keyof typeof ROLE_IN_UNIT_VALUES]

export const ROLE_IN_UNIT_LABELS: Record<TRoleInUnit, string> = {
  DIRECTOR: 'Giám đốc',
  UNIT_HEAD: 'Trưởng đơn vị',
  UNIT_DEPUTY: 'Phó đơn vị',
  ADMIN: 'Quản trị viên',
  CUSTOM: 'Cán bộ'
}
