export const DESTINATION_STATUS_VALUES = {
  unsent: 'UNSENT',
  acceptance: 'ACCEPTANCE',
  sent: 'SENT',
  // delivered: 'DELIVERED',
  assignment: 'ASSIGNMENT',
  processing: 'PROCESSING',
  finish: 'FINISH',
  revoked: 'REVOKED',
  rejection: 'REJECTION',
  cancellation: 'CANCELLATION',
  unsupported: 'UNSUPPORTED',
  changeAcceptance: 'CHANGE_ACCEPTANCE',
  changeRejection: 'CHANGE_REJECTION'
} as const

export type TDestinationStatusValues =
  (typeof DESTINATION_STATUS_VALUES)[keyof typeof DESTINATION_STATUS_VALUES]

export const DESTINATION_STATUS_DISPLAY: Record<
  TDestinationStatusValues,
  {
    label: string
    color: string
    bgColor: string
    icClass: string
  }
> = {
  UNSENT: {
    label: 'Chờ gửi',
    bgColor: '#455BD2',
    color: '#455BD2',
    icClass: 'icon-[hugeicons--time-half-pass]'
  },
  ACCEPTANCE: {
    label: 'Đã tiếp nhận',
    bgColor: '#9426EE',
    color: '#9426EE',
    icClass: 'icon-[carbon--document-tasks]'
  },
  SENT: {
    label: 'Đã gửi',
    bgColor: '#BEEFFF',
    color: 'var(--primary-color)',
    icClass: 'icon-[si--arrow-right-fill]'
  },
  // DELIVERED: {
  //   label: 'Đã gửi đến',
  //   bgColor: '#9426EE',
  //   color: '#9426EE',
  //   icClass: 'icon-[carbon--document-tasks]'
  // },
  ASSIGNMENT: {
    label: 'Đã phân công',
    bgColor: '#455BD2',
    color: '#455BD2',
    icClass: 'icon-[ci--arrow-left-right]'
  },
  PROCESSING: {
    label: 'Đang xử lý',
    bgColor: '#EE8626',
    color: '#EE8626',
    icClass: 'icon-[ci--arrows-reload-01]'
  },
  FINISH: {
    label: 'Đã hoàn thành',
    bgColor: '#00875A',
    color: '#00875A',
    icClass: 'icon-[solar--check-square-broken]'
  },
  REVOKED: {
    label: 'Đã thu hồi',
    bgColor: '#C61654',
    color: '#C61654',
    icClass: 'icon-[line-md--file-document-minus]'
  },
  REJECTION: {
    label: 'Từ chối tiếp nhận',
    bgColor: '#FC0D1B',
    color: '#FC0D1B',
    icClass: 'icon-[icon-park--return]'
  },
  UNSUPPORTED: {
    label: 'Không hỗ trợ',
    bgColor: '#FC0D1B',
    color: '#FC0D1B',
    icClass: 'icon-[cuida--warning-outline]'
  },
  CANCELLATION: {
    label: 'Đã huỷ',
    bgColor: '#C61654',
    color: '#C61654',
    icClass: 'icon-[material-symbols--cancel-outline-rounded]'
  },
  CHANGE_ACCEPTANCE: {
    label: 'Đồng ý cập nhật',
    bgColor: '#C61654',
    color: '#C61654',
    icClass: 'icon-[tabler--switch-3]'
  },
  CHANGE_REJECTION: {
    label: 'Từ chối cập nhật',
    bgColor: '#C61654',
    color: '#C61654',
    icClass: 'icon-[tabler--switch-3]'
  }
}
