import { DOCUMENT_TYPES } from '@/shared/constants/document'

export const SCOPE = {
  CHILDREN: 'CHILDREN',
  SELF: 'SELF'
} as const

export const SCOPE_LIST = [
  {
    label: 'Chính mình',
    value: SCOPE.SELF
  },
  {
    label: 'Con',
    value: SCOPE.CHILDREN
  }
]

export const FLOW_OBJECT = {
  STAFF: 'STAFF',
  UNIT: 'UNIT'
} as const

export const DISTRIBUTE_TYPE = {
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
} as const

export const LEADERS = {
  LEADERS: 'LEADER',
  DEPUTY: 'DEPUTY'
} as const

export const DOC_TYPE_LIST = [
  {
    label: 'Văn bản nội bộ',
    value: DOCUMENT_TYPES.internalDoc
  },
  {
    label: 'Văn bản đi',
    value: DOCUMENT_TYPES.outDoc
  }
]
