import { appConfig } from '@/config/app-config'
import { omit } from 'lodash-es'

export const SIGN_PROVIDER_VALUES = {
  hmuh: 'HMUH',
  vnpt: 'VNPT',
  viettelRemote: 'VIETTEL_REMOTE',
  viettelSim: 'VIETTEL_SIM',
  mobiSim: 'MOBI_SIM',
  bsign: 'BSIGN',
  usb: 'USB',
  easyca: 'EASYCA'
} as const

export type TSignProvider = (typeof SIGN_PROVIDER_VALUES)[keyof typeof SIGN_PROVIDER_VALUES]

export const SIGN_PROVIDER_LABEL: Record<TSignProvider, string> = {
  HMUH: 'HMUH esign',
  VNPT: 'VNPT Ca',
  VIETTEL_REMOTE: 'Viettel MySign',
  VIETTEL_SIM: 'Viettel Sim CA',
  MOBI_SIM: 'MobiFone Sim CA',
  BSIGN: appConfig.VITE_ESIGN_PROVIDER_LABEL,
  USB: 'USB Token',
  EASYCA: 'Easy CA'
}

export const OD_SIGN_TYPES = {
  leaderUnitSigner: 'UNIT_SIGNER',
  staffUnitSigner: 'STAFF_UNIT_SIGNER',
  leaderCollaborator: 'DIRECTOR_COLLABORATOR',
  staffCollaborator: 'STAFF_COLLABORATOR',
  evaluator: 'EVALUATOR',
  formatSigner: 'FORMAT_SIGNER',
  leaderFormatSigner: 'DIRECTOR_FORMAT_SIGNER',
  majorSigner: 'MAJOR_SIGNER',
  minorSigner: 'MINOR_SIGNER',
  creator: 'CREATOR'
} as const

export type TODSignTypes = (typeof OD_SIGN_TYPES)[keyof typeof OD_SIGN_TYPES]

export type TODSignleStaffSignTypes = Extract<
  TODSignTypes,
  'EVALUATOR' | 'FORMAT_SIGNER' | 'DIRECTOR_FORMAT_SIGNER' | 'MAJOR_SIGNER' | 'MINOR_SIGNER'
>
export type TODMultipleStaffSignTypes = Extract<
  TODSignTypes,
  'UNIT_SIGNER' | 'STAFF_UNIT_SIGNER' | 'DIRECTOR_COLLABORATOR' | 'STAFF_COLLABORATOR'
>

export const OD_SIGN_TYPE_LABELS: Record<Exclude<TODSignTypes, 'CREATOR'>, string> = {
  UNIT_SIGNER: 'Lãnh đạo trực tiếp trong đơn vị',
  STAFF_UNIT_SIGNER: 'Cán bộ trong đơn vị',
  DIRECTOR_COLLABORATOR: 'Lãnh đạo ký trình và đồng trình',
  STAFF_COLLABORATOR: 'Cán bộ ký trình và đồng trình',
  EVALUATOR: 'Người duyệt thể thức',
  FORMAT_SIGNER: 'Người ký duyệt thể thức',
  DIRECTOR_FORMAT_SIGNER: 'Lãnh đạo ký duyệt thể thức',
  MAJOR_SIGNER: 'Lãnh đạo ký ban hành',
  MINOR_SIGNER: 'Lãnh đạo ký thông qua'
}

export const ITD_SIGN_TYPE_LABELS: Record<Exclude<TODSignTypes, 'CREATOR'>, string> = {
  UNIT_SIGNER: 'Lãnh đạo trực tiếp trong đơn vị',
  STAFF_UNIT_SIGNER: 'Cán bộ trong đơn vị',
  DIRECTOR_COLLABORATOR: 'Lãnh đạo ký trình và đồng trình',
  STAFF_COLLABORATOR: 'Cán bộ ký trình và đồng trình',
  EVALUATOR: 'Người duyệt thể thức',
  FORMAT_SIGNER: 'Người ký duyệt thể thức',
  DIRECTOR_FORMAT_SIGNER: 'Lãnh đạo ký duyệt thể thức',
  MAJOR_SIGNER: 'Lãnh đạo ký phê duyệt',
  MINOR_SIGNER: 'Lãnh đạo ký thông qua'
}


export const OD_EXTERNAl_SIGN_TYPE_OPTS = omit(OD_SIGN_TYPE_LABELS, 'CREATOR', 'MINOR_SIGNER')
export const OD_INTERNAL_DOC_SIGN_TYPE_OPTS = {
  ...omit(OD_SIGN_TYPE_LABELS, 'CREATOR', 'MAJOR_SIGNER'),
  MAJOR_SIGNER: 'Lãnh đạo ký phê duyệt'
}
