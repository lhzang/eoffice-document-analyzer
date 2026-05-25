import type { EdocDTO } from '@/shared/services/api'
import type { TDocumentCreated, TListAbleToDistributeUnit } from '../models/types'

export const dataListEDocs: EdocDTO[] = [
  {
    code: {
      number: '12',
      notation: 'GM-BVHTTDL'
    },
    fromOrg: {
      id: 'G16',
      name: 'Bộ Văn hoá, Thể thao và Du lịch'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025 bản, In và Phát hành xuất bản phẩm năm 2025 bản, In và Phát hành xuất bản phẩm năm 2025 bản, In và Phát hành xuất bản phẩm năm 2025 bản, In và Phát hành xuất bản phẩm năm 2025 bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:32:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '13',
      notation: 'TR-BVHTTDL'
    },
    fromOrg: {
      id: 'G05.32',
      name: 'Học viện Chính sách và phát triển'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:22:00.000-04:00',
    receiver: 'ACCEPTANCE'
  },
  {
    code: {
      number: '14',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'V/v mở các lớp BD đối với LĐ, quản lý cấp phòng và tương đương; lớp Chuyên viên và tương đương được tc trong tháng 5 (CÔNG VĂN SỐ 91/HVCSPT-TTBD)',
    lastVersionReceivedAt: '2025-05-20T11:11:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '140',
      notation: 'GM-BXD'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Về việc triển khai các nhiệm vụ sự nghiệp khoa học công nghệ; sự nghiệp kinh tế; sự nghiệp môi trường của Bộ năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:42:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '16',
      notation: 'TB-CHHĐTVN'
    },
    fromOrg: {
      id: 'G04.16',
      name: 'Cục Hàng hải và Đường thủy Việt Nam'
    },
    subject:
      'TBKL của PCT Hoàng Hồng Giang tại cuộc họp về xây dựng Quy chuẩn kỹ thuật quốc gia về cơ sở vật chất, trang thiết bị đào tạo của cơ sở đào tạo, huấn luyện thuyền viên hàng hải',
    lastVersionReceivedAt: '2025-05-20T11:31:00.000-04:00',
    receiver: 'INBOX'
  },
  {
    code: {
      number: '123',
      notation: 'GM-BVHTTDL'
    },
    fromOrg: {
      id: 'G36',
      name: 'Bộ Văn hoá, Thể thao và Du lịch'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:14:00.000-04:00',
    receiver: 'REJECTION'
  },
  {
    code: {
      number: '112',
      notation: 'GM-BVHTTDL'
    },
    fromOrg: {
      id: 'G16',
      name: 'Bộ Văn hoá, Thể thao và Du lịch'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-04-20T11:32:00.000-04:00',
    receiver: 'ASSIGNMENT'
  },
  {
    code: {
      number: '1416',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:21:00.000-04:00',
    receiver: 'ACCEPTANCE'
  },
  {
    code: {
      number: '1418',
      notation: 'GM-BVHTTDL'
    },
    fromOrg: {
      id: 'G16',
      name: 'Bộ Văn hoá, Thể thao và Du lịch'
    },
    subject:
      'Giấy mời: Tham dự Hội nghị triển khai nhiệm vụ trọng tâm công tác\nXuất bản, In và Phát hành xuất bản phẩm năm 2025 \n bản, In và Phát hành xuất bản phẩm năm 2025',
    lastVersionReceivedAt: '2025-05-20T11:31:00.000-04:00',
    receiver: 'FINISH'
  },
  {
    code: {
      number: '341',
      notation: 'QĐ-BXD'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Quyết định Thành lập Ban Chỉ đạo của Bộ Xây dựng về phát triển khoa học, công nghệ, đổi mới sáng tạo, chuyển đổi số và Đề án 06',
    lastVersionReceivedAt: '2025-05-20T11:34:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '1417',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Xin ý kiến dự thảo Thông tư sửa đổi, bổ sung Thông tư số 01/2025/TT-BNV ngày 17/01/2025 của Bộ trưởng Bộ Nội vụ hướng dẫn thực hiện chính sách, chế độ đối với cán bộ, công chức, viên chức, người lao động và lực lượng vũ trang trong thực hiện sắp xếp tổ chức bộ máy của hệ thống chính trị',
    lastVersionReceivedAt: '2025-04-20T11:33:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '1437',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Xin ý kiến dự thảo Thông tư sửa đổi, bổ sung Thông tư số 01/2025/TT-BNV ngày 17/01/2025 của Bộ trưởng Bộ Nội vụ hướng dẫn thực hiện chính sách, chế độ đối với cán bộ, công chức, viên chức, người lao động và lực lượng vũ trang trong thực hiện sắp xếp tổ chức bộ máy của hệ thống chính trị',
    lastVersionReceivedAt: '2025-04-20T11:33:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '127',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Xin ý kiến dự thảo Thông tư sửa đổi, bổ sung Thông tư số 01/2025/TT-BNV ngày 17/01/2025 của Bộ trưởng Bộ Nội vụ hướng dẫn thực hiện chính sách, chế độ đối với cán bộ, công chức, viên chức, người lao động và lực lượng vũ trang trong thực hiện sắp xếp tổ chức bộ máy của hệ thống chính trị',
    lastVersionReceivedAt: '2025-04-20T11:33:00.000-04:00',
    receiver: 'SENT'
  },
  {
    code: {
      number: '1217',
      notation: 'BXD-TCCB'
    },
    fromOrg: {
      id: 'G17',
      name: 'Bộ Xây dựng'
    },
    subject:
      'Xin ý kiến dự thảo Thông tư sửa đổi, bổ sung Thông tư số 01/2025/TT-BNV ngày 17/01/2025 của Bộ trưởng Bộ Nội vụ hướng dẫn thực hiện chính sách, chế độ đối với cán bộ, công chức, viên chức, người lao động và lực lượng vũ trang trong thực hiện sắp xếp tổ chức bộ máy của hệ thống chính trị',
    lastVersionReceivedAt: '2025-04-20T11:33:00.000-04:00',
    receiver: 'SENT'
  }
]

export const dataMockDocumentCreated: TDocumentCreated[] = Array.from({ length: 200 }).map(
  (_, index) => ({
    id: index.toString(),
    status: 'CREATED',
    shortDescription: `test${index} van ban qua dai khong can phai duoc rut ngan lai ${index}`,
    documentCode: `${index + 1}/GD-SDT`,
    arrivalDate: '2025-05-20T11:31:00.000-04:00',
    dueDate: '2025-05-20T11:31:00.000-04:00',
    issuer: {
      type: index % 2 === 0 ? 'EXTERNAL' : 'INTERNAL',
      id: `OutOrg${index}`
    },
    source: {
      type: index % 2 === 0 ? 'INCOMING_DOCUMENT' : 'OUTGOING_DOCUMENT',
      docId: index % 2 === 0 ? `INCOMING_DOCUMENT${index + 1}` : `OUTGOING_DOCUMENT${index + 1}`
    }
  })
)

export const dataListAbleToDistributeUnits: TListAbleToDistributeUnit[] = Array.from({
  length: 10
}).map((_, index) => ({
  id: index.toString(),
  name: `Đơn vị ${index}`
}))
