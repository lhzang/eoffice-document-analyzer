import type { PageDocumentBook } from '@/shared/services/api'
import type { IDocumentType } from '../../model/types'

export const dataDocumentTypes: IDocumentType[] = [
  {
    _id: '65b768bfd9ec99dd51707b8b',
    name: 'Biên bản',
    shortName: 'BB',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b8a',
    name: 'Báo cáo',
    shortName: 'BC',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b90',
    name: 'Bản ghi nhớ',
    shortName: 'BGN',
    expiredDate: 12
  },
  {
    _id: '65b768bfd9ec99dd51707b91',
    name: 'Bản thỏa thuận',
    shortName: 'BTT',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b81',
    name: 'Chương trình',
    shortName: 'CTr',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b7b',
    name: 'Chỉ thị mới',
    shortName: 'CT',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b94',
    name: 'Công văn',
    shortName: 'CV',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b8e',
    name: 'Công điện',
    shortName: 'CĐ',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b89',
    name: 'Dự án',
    shortName: 'DA',
    expiredDate: 14
  },
  {
    _id: '65eecbd74b785f87a8bbb1f9',
    name: 'Giấy chứng nhận',
    shortName: 'GCN',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b95',
    name: 'Giấy giới thiệu',
    shortName: 'GGT',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b8f',
    name: 'Giấy mời',
    shortName: 'GM',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b96',
    name: 'Giấy nghỉ phép',
    shortName: 'GNP',
    expiredDate: 11,
    isPlusExpired: false
  },
  {
    _id: '667007f7175a5cd388324a58',
    name: 'Giấy xác nhận',
    shortName: 'GXN',
    expiredDate: 14,
    isPlusExpired: true
  },
  {
    _id: '65f2bc238fe53a17352bc8f3',
    name: 'Giấy đi đường',
    shortName: '/GGT',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b92',
    name: 'Giấy ủy quyền',
    shortName: 'GUQ',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b80',
    name: 'Hướng dẫn',
    shortName: 'HD',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b8d',
    name: 'Hợp đồng lao động',
    shortName: 'HĐ',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65fbe6605991bbb46af0b6c5',
    name: 'Hợp đồng làm việc',
    shortName: 'HĐLV',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b82',
    name: 'Kế hoạch',
    shortName: 'KH',
    expiredDate: 14
  },
  {
    _id: '668d0cf58ebc866d53b60bf9',
    name: 'Kết luận',
    shortName: 'KL',
    expiredDate: 14,
    isPlusExpired: true
  },
  {
    _id: '65b768bfd9ec99dd51707b7a',
    name: 'Nghị quyết',
    shortName: 'NQ',
    expiredDate: 14,
    isPlusExpired: false
  },
  {
    _id: '65b768bfd9ec99dd51707b87',
    name: 'Phiếu báo',
    shortName: 'PB',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b86',
    name: 'Phiếu chuyển',
    shortName: 'PC',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b93',
    name: 'Phiếu gửi',
    shortName: 'PG',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b84',
    name: 'Phương án',
    shortName: 'PA',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b7c',
    name: 'Quy chế',
    shortName: 'QC',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b7d',
    name: 'Quy định',
    shortName: 'QYĐ',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b83',
    name: 'Quyết định',
    shortName: 'QĐ',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b7f',
    name: 'Thông báo',
    shortName: 'TB',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b7e',
    name: 'Thông cáo',
    shortName: 'TQ',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b88',
    name: 'Thư công',
    shortName: 'TC',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b8c',
    name: 'Tờ trình',
    shortName: 'TTr',
    expiredDate: 14
  },
  {
    _id: '65e69b6d56ef18e2896063f6',
    name: 'Đề nghị',
    shortName: 'ĐN',
    expiredDate: 14
  },
  {
    _id: '65b768bfd9ec99dd51707b85',
    name: 'Đề án',
    shortName: 'ĐA',
    expiredDate: 14
  }
]

export function genMockAdminDocTypeData(
  page: number,
  pageSize: number,
  unpaged: boolean
): PageDocumentBook {
  return {
    totalPages: Math.ceil(245 / pageSize),
    size: pageSize,
    number: page,
    totalElements: 245,
    content: unpaged
      ? Array.from({ length: 245 }).map((_, index) => ({
          id: index.toString(),
          name: 'Văn bản' + index,
          shortName: 'VB' + index
        }))
      : Array.from({ length: pageSize }).map((_, index) => ({
          id: ((page - 1) * pageSize + index).toString(),
          name: 'Văn bản' + ((page - 1) * pageSize + index),
          shortName: 'VB' + ((page - 1) * pageSize + index)
        }))
  }
}
