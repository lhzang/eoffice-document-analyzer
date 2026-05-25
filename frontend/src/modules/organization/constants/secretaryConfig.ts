export const SECRETARY_APPROVE_CONFIG_VALUES = {
  optional: 'OPTIONAL',
  parallel: 'PARALLEL',
  sequence: 'SEQUENCE'
} as const
export type TSecretaryApproveConfig =
  (typeof SECRETARY_APPROVE_CONFIG_VALUES)[keyof typeof SECRETARY_APPROVE_CONFIG_VALUES]
export const SECRETARY_APPROVE_CONFIG_LABELS: Record<TSecretaryApproveConfig, string> = {
  OPTIONAL: 'Không duyệt',
  PARALLEL: 'Đồng duyệt',
  SEQUENCE: 'Duyệt lần lượt'
}

export const SECRETARY_VIEW_INDOC_CONFIG_VALUES = {
  disabled: 'DISABLED',
  detailed: 'DETAILED',
  viewInfoOnly: 'NO_ATTACHMENT'
} as const
export type TSecretaryViewIndocConfig =
  (typeof SECRETARY_VIEW_INDOC_CONFIG_VALUES)[keyof typeof SECRETARY_VIEW_INDOC_CONFIG_VALUES]
export const SECRETARY_VIEW_INDOC_CONFIG_LABELS: Record<TSecretaryViewIndocConfig, string> = {
  DISABLED: 'Không xem',
  NO_ATTACHMENT: 'Xem thông tin',
  DETAILED: 'Xem thông tin và văn bản'
}
