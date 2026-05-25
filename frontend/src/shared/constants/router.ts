import { appConfig } from '@/config/app-config'

// src/router/routerPaths.ts
export const ROUTE_PATHS = {
  dashboard: '/',
  notFound: '/not-found',
  forbiden: '/forbiden',
  login: '/login',
  verify: '/verify',
  verifyDocument: '/verify/:id',
  loginCallback: '/oauth2-callback',
  notification: '/notification',
  search: '/document-search',
  outDoc: {
    create: '/out-document/create',
    createPaper: '/out-document/create/signed',
    process: '/out-document/process',
    created: '/out-doc/created',
    reject: '/out-doc/reject',
    issue: '/out-doc/issue',
    keepNumber: '/out-doc/keep-number',
    reRegisterDoc: '/out-doc/re-register/:id'
  },
  internalDoc: {
    create: '/internal-document/create',
    process: '/internal-document/process',
    created: '/internal-doc/created',
    reject: '/internal-doc/reject',
    search: '/internal-doc/search',
    reRegisterDoc: '/internal-doc/re-register/:id'
  },
  incomingDoc: {
    addPaper: '/incoming-doc/add-paper-document',
    inDocInternet: '/incoming-doc/in-doc-internet',
    inDocProcessing: '/incoming-doc/wait-for-review',
    inDocCreated: '/incoming-doc/created',
    inDocRevoked: '/incoming-doc/revoked',
    inDocRejected: '/incoming-doc/rejected'
  },
  room: '/room',

  //clerical
  clerical: {
    documentBook: '/clerical/document-book',
    adminDocumentType: '/clerical/document-type',
    externalOrganization: '/clerical/external-organization',
    printDocumentBook: '/clerical/print-document-book'
  },

  // quản lí ký số
  esign: {
    userAccount: '/esign-system/user-account-info',
    esignAccount: '/esign-system/esign-account-info',
    signatureImage: '/esign-system/signature-image',
    signatureImageReview: '/esign-system/review-signature-image',
    signingHistory: '/esign-system/signing-history',
    signingDevice: '/esign-system/signing-device',
    esignSystem: appConfig.VITE_ESIGN_REDIRECT_URL
  },

  // admin
  admin: {
    inDocFlowConfig: '/organization/indoc-flow',
    authorizationConfig: '/organization/authorization',
    staffManagement: '/organization/staff-manage',
    staffManagementDetail: '/organization/staff-manage/:id',
    outDocSignTemplate: '/organization/sign-template',
    unitManagement: '/organization/unit-manage',
    secretaryManagement: '/organization/secretary-manage'
  },

  user: {
    userProfile: '/user/profile'
  },

  // task
  task: {
    createTask: '/task/create',
    taskList: '/task/list',
    taskDetail: '/task/detail'
  },

  //car
  car: {
    register: '/car/register',
    requestList: '/car/request-list',
    createdList: '/car/created-list',
    list: '/car/list',
    delagation: '/car/delagate',
    approvedelagation: '/car/approve-delagation'
  },
  //job profile
  records: {
    recordsList: '/records',
    personalRecords: '/records/personal',
    archiveRecords: '/records/archive'
  },
  //system
  system: {
    systemConfig: '/system/config'
  },

  // exception
  exception: {
    editIssuedDoc: '/exception/edit-issued-doc',
    exceptionHistory: '/exception/exception-history'
  },

  // statistics
  statistics: {
    incoming: '/statistics/incoming'
  }
} as const

export const ROUTES_DISPLAY = {
  login: {
    name: 'Login',
    label: 'Login'
  },
  search: {
    name: 'search',
    label: 'Tìm kiếm văn bản'
  },
  verifyDocument: {
    name: 'verifyDocument',
    label: 'Kiểm tra chữ ký số'
  },
  dashboard: {
    name: 'HomePage',
    label: 'Dashboard'
  },
  notFound: {
    label: 'Trang không tồn tại',
    name: 'notFound'
  },
  forbiden: {
    label: 'Không có quyền truy cập',
    name: 'forbiden'
  },
  notification: {
    label: 'Thông báo',
    name: 'notification'
  },
  addPaperInDoc: {
    name: 'AddPaperInDoc',
    label: 'Nhập văn bản đến giấy'
  },
  inDocInternet: {
    name: 'InDocInternet',
    label: 'Nhập văn bản đến qua mạng'
  },
  inDocReview: {
    name: 'InDocReview',
    label: 'Văn bản cần xử lý'
  },
  inDocCreated: {
    name: 'InDocCreated',
    label: 'Văn bản đã tạo'
  },
  inDocRevoked: {
    name: 'InDocRevoked',
    label: 'Văn bản đã thu hồi'
  },
  inDocRejected: {
    name: 'InDocRejected',
    label: 'Văn bản đã bị trả lại'
  },
  outDocCreate: {
    name: 'CreateOutDoc',
    label: 'Đăng ký phát hành ký số'
  },
  outDocCreatePaper: {
    name: 'CreateOutDocPaper',
    label: 'Đăng ký văn bản ký giấy'
  },
  outDocReRegister: {
    name: 'outDocReRegister',
    label: 'Trình lại văn bản'
  },
  outDocProcess: {
    name: 'OutDocProcess',
    label: 'Văn bản cần xử lý'
  },
  outDocCreated: {
    name: 'OutDocCreated',
    label: 'Văn bản đã tạo'
  },
  outDocRejected: {
    name: 'OutDocRevoked',
    label: 'Văn bản bị trả lại'
  },
  outDocIssue: {
    name: 'outDocIssue',
    label: 'Cấp số văn bản'
  },
  internalDocCreate: {
    name: 'crateInternal',
    label: 'Đăng ký phát hành nội bộ'
  },
  searchInternalDoc: {
    name: 'searchInternalDoc',
    label: 'Tra cứu văn bản nội bộ'
  },
  internalDocReRegister: {
    name: 'internalDocReRegister',
    label: 'Trình lại văn bản'
  },
  internalDocProcess: {
    name: 'internalDocProcess',
    label: 'Văn bản cần xử lý'
  },
  internalDocCreated: {
    name: 'internalDocCreated',
    label: 'Văn bản đã tạo'
  },
  internalDocRejected: {
    name: 'internalDocRevoked',
    label: 'Văn bản bị trả lại'
  },

  keepNumberOD: {
    name: 'keepNumberOD',
    label: 'Đăng ký giữ số'
  },
  verify: {
    name: 'verify',
    label: 'Xác minh'
  },
  clericaDocumentBook: {
    name: 'clericaDocumentBook',
    label: 'Quản lý sổ văn bản'
  },
  clericaDocumentType: {
    name: 'clericaDocumentType',
    label: 'Quản lý loại văn bản'
  },
  externalOrganization: {
    name: 'externalOrganization',
    label: 'Quản lý đơn vị bên ngoài'
  },
  printDocumentBook: {
    name: 'printDocumentBook',
    label: 'Báo cáo in sổ văn bản'
  },
  // esign
  userAccount: {
    name: 'esignUserAccount',
    label: 'Tài khoản đăng nhập'
  },
  esignAccount: {
    name: 'esignAccount',
    label: 'Tài khoản ký số'
  },
  signatureImage: {
    name: 'signatureImage',
    label: 'Ảnh chữ ký'
  },
  signatureImageReview: {
    name: 'signatureImageReview',
    label: 'Duyệt ảnh chữ ký'
  },
  signingHistory: {
    name: 'signingHistory',
    label: 'Lịch sử ký'
  },
  signingDevice: {
    name: 'signingDevice',
    label: 'Danh sách thiết bị'
  },
  esignSystem: {
    name: 'esignSystem',
    label: 'Hệ thống ký số'
  },

  userProfile: {
    name: 'userProfile',
    label: 'Thông tin cá nhân'
  },
  systemConfig: {
    name: 'systemConfig',
    label: 'Thông tin đơn vị'
  },
  createTask: {
    name: 'createTask',
    label: 'Tạo công việc'
  },
  taskList: {
    name: 'taskList',
    label: 'Danh sách công việc'
  },
  taskDetail: {
    name: 'taskDetail',
    label: 'Chi tiết công việc'
  },

  //organization
  inDocFlow: {
    name: 'inDocFlow',
    label: 'Cấu hình luồng văn bản đến'
  },
  authorizationConfig: {
    name: 'authorizationConfig',
    label: 'Cấu hình phân quyền'
  },
  outDocSignTemplate: {
    name: 'outDocSignTemple',
    label: 'Mẫu trình tự ký văn bản'
  },
  staffManagement: {
    name: 'staffManagement',
    label: 'Quản lý nhân sự'
  },
  staffDetail: {
    name: 'staffDetail',
    label: 'Chi tiết nhân sự'
  },
  adminDocumentBookManagement: {
    name: 'adminDocumentBook',
    label: 'Quản lý sổ văn bản'
  },
  unitManagement: {
    name: 'unitManagement',
    lable: 'Quản lý đơn vị'
  },
  secretaryManagement: {
    name: 'secretaryManagement',
    label: 'Cấu hình thư ký - lãnh đạo'
  },

  //car
  carRegister: {
    name: 'carRegister',
    label: 'Đăng ký xe'
  },
  carList: {
    name: 'carList',
    label: 'Danh sách xe'
  },
  carRequestList: {
    name: 'carRequestList',
    label: 'Danh sách yêu cầu'
  },
  carCreatedList: {
    name: 'carCreatedList',
    label: 'Danh sách đã tạo'
  },
  carDelagation: {
    name: 'carDelagation',
    label: 'Phân quyền quản trị'
  },
  carApprovedelagation: {
    name: 'carApprovedelagation',
    label: 'Phân quyền duyệt xe'
  },

  // exception
  exception: {
    editIssuedDoc: 'Chỉnh sửa văn bản ban hành'
  },
  exceptionHistory: {
    exceptionHistory: 'Lịch sử chỉnh sửa văn bản'
  },
  //record
  recordsList: {
    name: 'recordsList',
    label: 'Danh mục hồ sơ'
  },
  personalRecords: {
    name: 'personalRecords',
    label: 'Hồ sơ cá nhân'
  },
  archiveRecords: {
    name: 'archiveRecords',
    label: 'Lưu trữ hồ sơ'
  },
  // statistics
  incomingStatistics: {
    name: 'incomingStatistics',
    label: 'Thống kê văn bản đến'
  }
} as const

type DeepPaths<T> = T extends string
  ? T
  : {
      [K in keyof T]: DeepPaths<T[K]>
    }[keyof T]

export type AllValidPaths = DeepPaths<typeof ROUTE_PATHS> // auto union of all paths
