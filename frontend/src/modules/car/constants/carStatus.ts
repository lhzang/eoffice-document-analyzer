export const CAR_STATUS = {
  pending: 'PENDING',
  accepted: 'ACCEPTED',
  rejected: 'REJECTED'
} as const
export const CAR_STATUS_LIST = [
  {
    label: 'Chờ duyệt',
    value: CAR_STATUS.pending,
    color: {
      bg: '#deebff',
      text: '#0045ad'
    }
  },
  {
    label: 'Đã duyệt',
    value: CAR_STATUS.accepted,
    color: {
      bg: '#f6ffee',
      text: '#317d1c'
    }
  },
  {
    label: 'Từ chối',
    value: CAR_STATUS.rejected,
    color: {
      bg: '#fff1f0',
      text: '#cd1829'
    }
  }
]
