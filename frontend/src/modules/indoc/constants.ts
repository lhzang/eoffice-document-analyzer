import type { InDocDocumentVMDocumentStatusEnum } from '@/shared/services/api'
import type { TDestinationStatus } from './models/types'

export const GetListDocumentsToProcessStatusEnum = {
  WaitForProcessing: 'WAIT_FOR_PROCESSING',
  Processing: 'PROCESSING',
  Processed: 'PROCESSED'
} as const

export const DestinationStatusConfig = {
  sent: {
    title: 'Đã gửi đi',
    bgColor: '#BEEFFF',
    color: 'var(--p-primary-color)',
    icon: 'icon-[hugeicons--package-sent] text-primary'
  },
  rejection: {
    title: 'Từ chối tiếp nhận',
    bgColor: '#FC0D1B',
    color: '#fff',
    icon: 'icon-[icon-park-outline--reject] text-[#FC0D1B]'
  },
  acceptance: {
    title: 'Đã tiếp nhận',
    bgColor: '#9426EE',
    color: '#fff',
    icon: 'icon-[healthicons--i-documents-accepted-outline] text-[#9426EE]'
  },
  assignment: {
    title: 'Đã phân công',
    bgColor: '#455BD2',
    color: '#fff',
    icon: 'icon-[hugeicons--assignments] text-[#455BD2]'
  },
  processing: {
    title: 'Đang xử lý',
    bgColor: '#EE8626',
    color: '#fff',
    icon: 'icon-[uim--process] text-[#EE8626]'
  },
  finish: {
    title: 'Đã hoàn thành',
    bgColor: '#00875A',
    color: '#fff',
    icon: 'icon-[ep--finished] text-[#00875A]'
  },
  change_acceptance: {
    title: 'Đồng ý cập nhật văn bản',
    bgColor: '#00875A',
    color: '#fff',
    icon: 'icon-[ep--finished] text-[#00875A]'
  },
  change_rejection: {
    title: 'Từ chối cập nhật văn bản',
    bgColor: '#00875A',
    color: '#fff',
    icon: 'icon-[ep--finished] text-[#00875A]'
  },
  unknown: {
    title: 'Không thể gửi: Đơn vị nhận không có mã định danh',
    bgColor: '#C61654',
    color: '#fff',
    icon: 'icon-[material-symbols--unknown-document-outline] text-[#C61654]'
  },
  failure: {
    title: 'Không thể gửi: Đơn vị phát hành không có mã định danh',
    bgColor: '#C61654',
    color: '#fff',
    icon: 'icon-[icon-park-outline--doc-fail] text-[#C61654]'
  },
  inbox: {
    // title: 'Hệ thống đã tiếp nhận văn bản',
    title: 'Đã gửi đến',
    bgColor: '#9426EE',
    color: '#fff',
    icon: 'icon-[fluent--mail-inbox-checkmark-20-regular] text-[#9426EE]'
  }
} as const satisfies Record<
  TDestinationStatus,
  {
    title: string
    bgColor: string
    color: string
    icon: string
  }
>

export const InComingDocumentConfig: Record<
  InDocDocumentVMDocumentStatusEnum,
  {
    title: string
    bgColor: string
    color: string
  }
> = {
  // WAIT_FOR_RECEIVE: {
  //   title: 'Chờ tiếp nhận',
  //   bgColor: '#00C7E6',
  //   color: '#fff'
  // // },
  // WAIT_FOR_SIGN: {
  //   title: 'Chờ ký số',
  //   bgColor: '#E6CCFF',
  //   color: '#6554C0'
  // },
  CREATED: {
    title: 'Chờ tiếp nhận',
    bgColor: '#E6CCFF',
    color: '#6554C0'
  },
  REGISTERED: {
    title: 'Đã nhập sổ',
    bgColor: '#E6CCFF',
    color: '#6554C0'
  },
  // UPDATE_REQUIRED: {
  //   title: 'Chờ cập nhật',
  //   bgColor: '#E6CCFF',
  //   color: '#6554C0'
  // },
  DISTRIBUTED: {
    title: 'Đã phân phối',
    bgColor: '#58BD7D',
    color: '#FFFFFF'
  },
  PROPOSED: {
    title: 'Đã đề xuất',
    bgColor: '#E6CCFF',
    color: '#6554C0'
  },
  REJECTED: {
    title: 'Đã trả lại',
    bgColor: '#23262F',
    color: '#FFFFFF'
  },
  REVOKED: {
    title: 'Đã thu hồi',
    bgColor: '#FFE1DA',
    color: '#FF4D4F'
  },
  FINISHED: {
    title: 'Đã kết thúc',
    bgColor: '#4F59D4',
    color: '#FFFFFF'
  },
  // ENDED: {
  //   title: 'Đã kết thúc',
  //   bgColor: '#23262F',
  //   color: '#FCFCFD'
  // },
  CANCELED: {
    title: 'Đã bị hủy',
    bgColor: '#FF5630',
    color: '#FFFFFF'
  },
  // DISTRIBUTION_REJECTED: {
  //   title: 'Đã từ chối phân phối',
  //   bgColor: '#E6CCFF',
  //   color: '#6554C0'
  // },
  REPLACEMENT: {
    title: 'Đã thay thế',
    bgColor: '#E6CCFF',
    color: '#6554C0'
  }
  // WAIT_FOR_PROPOSE: {
  //   title: 'Chờ đề xuất',
  //   bgColor: '#E6CCFF',
  //   color: '#6554C0'
  // }
} as const
