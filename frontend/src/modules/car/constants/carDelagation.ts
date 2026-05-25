export const CAR_TAB_VALUES = {
  view: 'VIEW',
  approveAndRegister: 'APPROVE_AND_REGISTER',
  delete: 'DELETE'
} as const
export const CAR_TAB_LIST = [
  {
    label: 'Quyền xem xe',
    value: CAR_TAB_VALUES.view
  },
  {
    label: 'Quyền duyệt và đăng ký xe',
    value: CAR_TAB_VALUES.approveAndRegister
  },
  {
    label: 'Quyền xoá xe',
    value: CAR_TAB_VALUES.delete
  }
]

export const APPROVE_AND_REGISTER_PERMISSIONS = {
  approveStaff: 'APPROVE_STAFF',
  approveGuest: 'APPROVE_GUEST',
  registerStudent: 'REGISTER_STUDENT',
  registerUni: 'REGISTER_UNIVERSITY',
  registerCollaborator: 'REGISTER_COLLABORATOR'
} as const
