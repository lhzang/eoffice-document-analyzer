import type { TPermissionScopeValue } from '../models/organization/perrmission'

export const APP_PERMISSION_VALUES = {
  systemManage: 'admin.access.control',
  changePassword: 'admin.account.change_password',
  manageAccount: 'admin.account.manage',
  createExternalUnit: 'admin.external_unit.create',
  deleteExternalUnit: 'admin.external_unit.delete',
  listExternalUnit: 'admin.external_unit.list',
  readExternalUnit: 'admin.external_unit.read',
  updateExternalUnit: 'admin.external_unit.update',
  createUnitGroup: 'admin.group.create',
  deleteUnitGroup: 'admin.group.delete',
  updateUnitGroup: 'admin.group.update',
  configSecretary: 'admin.position.configure_secretary',
  createPosition: 'admin.position.create',
  deletePosition: 'admin.position.delete',
  viewPosition: 'admin.position.read',
  updatePosition: 'admin.position.update',
  manageUnit: 'admin.unit.manage',
  viewUnit: 'admin.unit.read',
  manageCar: 'car.admin.manage',
  createCollaboratorCar: 'car.collaborator_car.create',
  deleteCollaboratorCar: 'car.collaborator_car.delete',
  grantCollaboratorCar: 'car.collaborator_car.grant',
  viewCollaboratorCar: 'car.collaborator_car.list',
  deleteGuestCar: 'car.guest_car.delete',
  evaluateGuestCar: 'car.guest_car.evaluate',
  grantGuestCar: 'car.guest_car.grant',
  viewGuestCar: 'car.guest_car.list',
  grantEvaluateAndRegisterUnitCar: 'car.staff.grant_register_and_evaluate',
  deleteStaffCar: 'car.staff_car.delete',
  evaluateStaffCar: 'car.staff_car.evaluate',
  grantStaffCar: 'car.staff_car.grant',
  viewStaffCar: 'car.staff_car.list',
  createStudentCar: 'car.student_car.create',
  deleteStudentCar: 'car.student_car.delete',
  grantStudentCar: 'car.student_car.grant',
  viewStudentCar: 'car.student_car.list',
  createUniCar: 'car.university_car.create',
  deleteUniCar: 'car.university_car.delete',
  grantUniCar: 'car.university_car.grant',
  viewUniCar: 'car.university_car.list',
  viewDocumentBook: 'document_book.book.list',
  lockDocumentBook: 'document_book.book.lock',
  manageDocumentBook: 'document_book.book.manage',
  unlockDocumentBook: 'document_book.book.unlock',
  viewDocumentInBook: 'document_book.document.list',
  manageDocumentType: 'document_book.document_type.manage',
  createInternalDocumentBook: 'document_book.internal_book.create',
  manageKeepNumber: 'document_book.keep_number.manage',
  editBookStartNumber: 'document_book.start_number.edit',
  assignIndoc: 'indoc.document.assign',
  createPaperIndoc: 'indoc.document.create_paper',
  delegateIndoc: 'indoc.document.delegate',
  distributeIndoc: 'indoc.document.distribute',
  proposeDistributeIndoc: 'indoc.document.propose_distribute',
  receiveInternetIndoc: 'indoc.document.receive_internet',
  viewIndocFlow: 'indoc.flow.read',
  updateIndocFlow: 'indoc.flow.update',
  evaluateOutDoc: 'outdoc.document.evaluate',
  registerOutDoc: 'outdoc.document.create',
  outdocFormatSign: 'outdoc.document.format_signer',
  cancelOutDoc: 'outdoc.exception.cancel_out_document',
  updateIssueDateOutDoc: 'outdoc.exception.update_issued_date',
  updateAnexesOutDoc: 'outdoc.exception.update_annexes',
  replaceMainFileOutDoc: 'outdoc.exception.replace_main_file',
  manageSignTemplateOutDoc: 'outdoc.flow_sign_template.manage',
  issueOutDoc: 'outdoc.document.register',
  useStamp: 'outdoc.document.use_stamp',
  manageWorkRecordCategory: 'work_record.category.manage',
  archiveUnitWorkRecord: 'work_record.record.archive_unit',
  archiveUniversityWorkRecord: 'work_record.record.archive_university',
  evaluateWordRecord: 'work_record.record.evaluate',
  searchDocument: 'statistics.document.search',
  createRootUnit: 'admin.unit.create_root',
  inDocumentStatistics: 'indoc.statistics.view'
} as const

export type TAppFeatureKey = (typeof APP_PERMISSION_VALUES)[keyof typeof APP_PERMISSION_VALUES]

export const APP_PERMISSION_LIST_LABEL: Record<TAppFeatureKey, string> = {
  'admin.access.control': 'Quản trị hệ thống',
  'admin.account.change_password': 'Đổi mật khẩu',
  'admin.account.manage': 'Quản lý tài khoản',
  'admin.external_unit.create': 'Tạo đơn vị bên ngoài',
  'admin.external_unit.delete': 'Xóa đơn vị bên ngoài',
  'admin.external_unit.list': 'Xem danh sách đơn vị bên ngoài',
  'admin.external_unit.read': 'Đọc danh sách đơn vị bên ngoài',
  'admin.external_unit.update': 'Cập nhật thông tin đơn vị bên ngoài',
  'admin.group.create': 'Tạo khối đơn vị',
  'admin.group.delete': 'Xóa khối đơn vị',
  'admin.group.update': 'Cập nhật khối đơn vị',
  'admin.position.configure_secretary': 'Cấu hình thư ký lãnh đạo',
  'admin.position.create': 'Tạo chức vụ',
  'admin.position.delete': 'Xóa chức vụ',
  'admin.position.read': 'Xem danh sách nhân sự',
  'admin.position.update': 'Cập nhật thông tin chức vụ',
  'admin.unit.manage': 'Quản lý đơn vị',
  'admin.unit.read': 'Xem thông tin đơn vị',
  'car.admin.manage': 'Quản lý xe toàn hệ thống',
  'car.collaborator_car.create': 'Đăng ký xe cộng tác viên',
  'car.collaborator_car.delete': 'Xóa xe cộng tác viên',
  'car.collaborator_car.grant': 'Ủy quyền đăng ký xe cộng tác viên',
  'car.collaborator_car.list': 'Xem danh sách xe cộng tác viên',
  'car.guest_car.delete': 'Xóa xe khách',
  'car.guest_car.evaluate': 'Duyệt xe khách',
  'car.guest_car.grant': 'Ủy quyền duyệt xe khách',
  'car.guest_car.list': 'Xem danh sách xe khách',
  'car.staff.grant_register_and_evaluate': 'Ủy quyền xử lý xe cho cán bộ đơn vị',
  'car.staff_car.delete': 'Xóa xe cán bộ',
  'car.staff_car.evaluate': 'Duyệt xe cán bộ',
  'car.staff_car.grant': 'Ủy quyền duyệt xe cán bộ',
  'car.staff_car.list': 'Xem danh sách xe cán bộ',
  'car.student_car.create': 'Đăng ký xe người học',
  'car.student_car.delete': 'Xóa xe người học',
  'car.student_car.grant': 'Ủy quyền đăng ký xe người học',
  'car.student_car.list': 'Xem danh sách xe người học',
  'car.university_car.create': 'Đăng ký xe đại học',
  'car.university_car.delete': 'Xóa xe đại học',
  'car.university_car.grant': 'Ủy quyền đăng ký xe đại học',
  'car.university_car.list': 'Xem danh sách xe đại học',
  'document_book.book.list': 'Xem danh sách sổ văn bản',
  'document_book.book.lock': 'Khóa sổ văn bản',
  'document_book.book.manage': 'Quản lý sổ văn bản',
  'document_book.book.unlock': 'Mở khóa sổ văn bản',
  'document_book.document.list': 'Xem danh sách văn bản trong sổ',
  'document_book.document_type.manage': 'Quản lý loại văn bản',
  'document_book.internal_book.create': 'Tạo sổ văn bản nội bộ',
  'document_book.keep_number.manage': 'Quản lý giữ số',
  'document_book.start_number.edit': 'Cập nhật số bắt đầu trong sổ',
  'indoc.document.assign': 'Giao việc văn bản đến',
  'indoc.document.create_paper': 'Nhập sổ văn bản đến giấy',
  'indoc.document.delegate': 'Chuyển quyền xử lý văn bản',
  'indoc.document.distribute': 'Phân phối văn bản',
  'indoc.document.propose_distribute': 'Đề xuất phân phối văn bản',
  'indoc.document.receive_internet': 'Tiếp nhận văn bản đến qua mạng',
  'indoc.flow.read': 'Xem chi tiết luồng văn bản đến',
  'indoc.flow.update': 'Cập nhật luồng văn bản đến',
  'outdoc.document.evaluate': 'Duyệt văn bản',
  'outdoc.document.format_signer': 'Ký duyệt thể thức',
  'outdoc.exception.cancel_out_document': 'Huỷ văn bản đi',
  'outdoc.exception.update_issued_date': 'Thay đổi ngày ban hành',
  'outdoc.exception.update_annexes': 'Cập nhật file phụ lục',
  'outdoc.exception.replace_main_file': 'Cập nhật file văn bản',
  'outdoc.flow_sign_template.manage': 'Cấu hình luồng ký văn bản',
  'outdoc.document.register': 'Cấp số văn bản',
  'outdoc.document.create': 'Tạo văn bản đi',
  'outdoc.document.use_stamp': 'Sử dụng con dấu',
  'work_record.category.manage': 'Quản lý danh mục hồ sơ',
  'work_record.record.archive_unit': 'Duyệt lưu trữ hồ sơ công việc đơn vị',
  'work_record.record.archive_university': 'Duyệt lưu trữ hồ sơ công việc tổ chức',
  'work_record.record.evaluate': 'Duyệt hồ sơ',
  'statistics.document.search': 'Tìm kiếm văn bản',
  'admin.unit.create_root': 'Tạo đơn vị gốc',
  'indoc.statistics.view': 'Xem thống kê văn bản đến'
}

export const APP_PERMISSION_SCOPES = {
  ancestor: 'ANCESTOR',
  parent: 'PARENT',
  self: 'SELF',
  sibling: 'SIBLING',
  children: 'CHILDREN',
  descendant: 'DESCENDANT',
  all: 'ALL'
} as const

export const APP_PERMISSION_EFFECTS = {
  allow: 'ALLOW',
  deny: 'DENY'
} as const

export const APP_PERMISSION_SCOPE_LIST = [
  {
    label: 'Tất cả cấp trên',
    value: APP_PERMISSION_SCOPES.ancestor
  },
  {
    label: 'Cấp trên trực tiếp',
    value: APP_PERMISSION_SCOPES.parent
  },
  {
    label: 'Đơn vị hiện tại',
    value: APP_PERMISSION_SCOPES.self
  },
  {
    label: 'Các đơn vị cùng cấp',
    value: APP_PERMISSION_SCOPES.sibling
  },
  {
    label: 'Các đơn vị con trực tiếp ',
    value: APP_PERMISSION_SCOPES.children
  },
  {
    label: 'Tất cả cấp dưới',
    value: APP_PERMISSION_SCOPES.descendant
  },
  {
    label: 'Toàn bộ hệ thống',
    value: APP_PERMISSION_SCOPES.all
  }
]
export const APP_PERMISSION_SCOPE_LABEL: Record<TPermissionScopeValue, string> = {
  ANCESTOR: 'Tất cả cấp trên',
  PARENT: 'Cấp trên trực tiếp',
  SELF: 'Đơn vị hiện tại',
  SIBLING: 'Các đơn vị cùng cấp',
  CHILDREN: 'Các đơn vị con trực tiếp ',
  DESCENDANT: 'Tất cả cấp dưới',
  ALL: 'Toàn bộ hệ thống'
}
export const APP_PERMISSION_EFFECT_LIST = [
  {
    label: 'Cho phép',
    value: APP_PERMISSION_EFFECTS.allow
  },
  {
    label: 'Từ chối',
    value: APP_PERMISSION_EFFECTS.deny
  }
]
