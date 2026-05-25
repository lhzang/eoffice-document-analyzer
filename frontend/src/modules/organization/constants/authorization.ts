import type { TCommonSelectOptions } from '@/shared/components/form-elements/AppSelect.vue'

export const LIST_PERMISSON_SCOPES = {
  ALL: {
    value: 'ALL',
    title: 'Toàn tổ chức'
  },
  SELF: {
    value: 'SELF',
    title: 'Đơn vị hiện tại'
  },
  CHILDREN: {
    value: 'CHILDREN',
    title: 'Tất cả đơn vị trực thuộc và cấp dưới'
  },
  DECENDANT: {
    value: 'DECENDANT',
    title: 'Tất cả đơn vị cấp dưới'
  }
} as const

export const LIST_PERMISSON_SCOPE_OPTIONS: TCommonSelectOptions<
  keyof typeof LIST_PERMISSON_SCOPES
>[] = [
  {
    label: 'Toàn tổ chức',
    value: 'ALL'
  },
  {
    label: 'Đơn vị con',
    value: 'CHILDREN'
  },
  { label: 'Đơn vị hiện tại', value: 'SELF' },
  { label: 'Đơn vị hiện tại và đơn vị con', value: 'DECENDANT' }
]
