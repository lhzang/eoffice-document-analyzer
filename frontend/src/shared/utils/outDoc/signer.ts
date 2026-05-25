import { OD_SIGN_TYPES, type TODSignTypes } from '@/shared/constants/sign'
import type { TTreeStaffNodeNew } from '@/shared/models/organization/unit'
import type { TSigner, TSignerWithSignOrder, TSignStaff } from '@/shared/models/outDoc/signer'
import type { StaffVM } from '@/shared/services/api'

export const extractSignerValueFromStaffData = (staff: StaffVM) => ({
  positionId: staff?.positions?.[0]?.id,
  displayName: `${staff?.positions?.[0]?.titleAbbr} ${staff?.fullName}`,
  unitId: staff?.positions?.[0]?.unitId,
  roleInUnit: staff?.positions?.[0]?.roleInUnit
})

export const extractSignerValueFromStaffNode = (staffNode: TTreeStaffNodeNew) => ({
  positionId: staffNode?.positionId,
  displayName: staffNode?.displayName,
  unitId: staffNode?.parentUnit?.id,
  roleInUnit: staffNode?.roleInUnit
})

export const extractSignerFromIndexedValue = (
  indexedValues?: TSignerWithSignOrder[]
): TSigner[] | undefined => indexedValues?.map((indexValue) => indexValue?.staff)

export const getDisplayTypeLabel = (type: TODSignTypes, isInternal?: boolean) => {
  switch (type) {
    case OD_SIGN_TYPES?.evaluator:
      return 'Người duyệt'
    case OD_SIGN_TYPES.formatSigner:
      return 'Người duyệt thể thức'
    case OD_SIGN_TYPES.leaderCollaborator:
      return 'Lãnh đạo ký trình và đồng trình'
    case OD_SIGN_TYPES.leaderFormatSigner:
      return 'Lãnh đạo ký duyệt thể thức'
    case OD_SIGN_TYPES.minorSigner:
      return 'Lãnh đạo ký thông qua'
    case OD_SIGN_TYPES.leaderUnitSigner:
      return 'Lãnh đạo trực tiếp trong đơn vị'
    case OD_SIGN_TYPES.majorSigner:
      return !isInternal ? 'Lãnh đạo ban hành' : 'Lãnh đạo ký phê duyệt'
    case OD_SIGN_TYPES.staffCollaborator:
      return 'Cán bộ ký trình và đồng trình'
    case OD_SIGN_TYPES.staffUnitSigner:
      return 'Cán bộ trực tiếp trong đơn vị'
    default:
      return ''
  }
}

export const transformStaffIntoSignerFormat = (staff: TSignStaff): TSigner => {
  return {
    positionId: staff.id,
    displayName: staff.name,
    roleInUnit: staff.roleInUnit,
    unitId: staff.unitId
  }
}

export const transformStaffListToFormalFormat = (signerList: {
  signer: TSigner,
  userIndex: number
}[]) => {
  if (signerList?.some((signer) => signer?.userIndex !== 1)) {
    return signerList?.map((signerStep, idx) => ({ staff: signerStep?.signer, index: idx + 1 }))
  } else {
    return signerList?.map(signerStep => ({ staff: signerStep?.signer, index: 1 }))
  }
}