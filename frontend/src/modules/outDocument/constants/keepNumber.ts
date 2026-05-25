export const NUMBER_REGISTER_STATUS_VALUES = {
  used: 'USED',
  unUsed: 'UNUSED'
} as const
export type TNumberRegisterStatus =
  (typeof NUMBER_REGISTER_STATUS_VALUES)[keyof typeof NUMBER_REGISTER_STATUS_VALUES]

export const NUMBER_REGISTER_STATUS_LABELS: Record<TNumberRegisterStatus, string> = {
  USED: 'Đã sử dụng',
  UNUSED: 'Chưa sử dụng'
}
