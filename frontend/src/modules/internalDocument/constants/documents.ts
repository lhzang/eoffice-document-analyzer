import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'

export const INTERNAL_DOC_PROCESS_TYPES = {
  normal: 'NORMAL',
  noNum: 'NO_NUMBER',
  english: 'ENGLISH'
} as const
export const INTERNAL_DOC_PROCESS_LABEL: Record<TDocProcessType, string> = {
  NORMAL: 'Văn bản thông thường',
  NO_NUMBER: 'Văn bản không số hiệu',
  ENGLISH: 'Văn bản tiếng Anh'
} as const

export type TDocProcessType =
  (typeof INTERNAL_DOC_PROCESS_TYPES)[keyof typeof INTERNAL_DOC_PROCESS_TYPES]

export const INTERNAL_DOC_PROCESS_TYPES_LIST: TCommonSelectOptions<TDocProcessType>[] =
  Object.entries(INTERNAL_DOC_PROCESS_LABEL).map(([key, value]) => ({
    label: value,
    value: key as TDocProcessType
  }))
