import { ROLE_IN_UNIT_VALUES } from '@/shared/constants/common'
import { RECEIVER_SYSTEM_TYPES, RECEIVER_TYPES } from '@/shared/constants/document'
import { OD_SIGN_TYPES } from '@/shared/constants/sign'
import type {
  TTreeInternalItemNode,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import type { TDocumentSignFlow, TSigner } from '@/shared/models/outDoc/signer'
import type { DestinationVM, ExternalUnitVM, StaffVM } from '@/shared/services/api'
import type {
  TDestinationSelect,
  TExUnitDestinationSelect,
  TFormSelectDestinationValues,
  TInUnitDestinationSelect,
  TStaffDestinationSelect
} from '../../models/outDoc/destination'

export const formatSelectValueForExternalUnit = (
  externalUnit: ExternalUnitVM
): TExUnitDestinationSelect => ({
  id: externalUnit.id,
  name: externalUnit.name,
  axisOrgId: externalUnit?.axisOrgId,
  systemType: RECEIVER_SYSTEM_TYPES.external,
  type: RECEIVER_TYPES.UNIT
})
export const formatSelectValueForInternalUnit = (
  internalUnit: TTreeUnitWithStaffNode
): TInUnitDestinationSelect => ({
  id: internalUnit.id,
  name: internalUnit.name,
  systemType: RECEIVER_SYSTEM_TYPES.internal,
  type: RECEIVER_TYPES.UNIT
})
export const formatSelectValueForInternalStaff = (
  staff: TTreeStaffNodeNew
): TStaffDestinationSelect => ({
  id: staff.positionId,
  name: staff.displayName,
  systemType: RECEIVER_SYSTEM_TYPES.internal,
  roleInUnit: staff.roleInUnit,
  type: RECEIVER_TYPES.STAFF
})

export const formatSelectValueForInternalStaffFromStaffData = (
  staff: StaffVM
): TStaffDestinationSelect => ({
  id: staff?.positions?.[0]?.id,
  name: `${staff?.positions?.[0]?.titleAbbr} ${staff?.fullName}`,
  systemType: RECEIVER_SYSTEM_TYPES.internal,
  roleInUnit: staff?.positions?.[0]?.roleInUnit,
  type: RECEIVER_TYPES.STAFF
})

export const getAllEnableDecendantUnitsAndStaffs = (
  unit: TTreeUnitWithStaffNode,
  excludeDestinationList: Map<string, TDestinationSelect>,
  checkIfUnitDisabled: (unit: TInUnitDestinationSelect) => boolean,
  checkIfStaffDisabled: (staff: TStaffDestinationSelect) => boolean
): Map<string, TTreeInternalItemNode> => {
  const listDecendantUnitAndStaffs = new Map<string, TTreeInternalItemNode>()
  // get all enable decendant units + staffs
  unit?.staffs?.forEach((staff) => {
    if (!checkIfStaffDisabled(formatSelectValueForInternalStaff(staff))) {
      listDecendantUnitAndStaffs.set(staff.positionId, staff)
    }
  })

  unit?.subUnits?.forEach((subUnit) => {
    if (
      !checkIfUnitDisabled(formatSelectValueForInternalUnit(subUnit)) &&
      !excludeDestinationList.has(subUnit.id) &&
      !subUnit?.isGroup &&
      !subUnit?.containStaff
    ) {
      listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
    }
    getAllEnableDecendantUnitsAndStaffs(
      subUnit,
      excludeDestinationList,
      checkIfUnitDisabled,
      checkIfStaffDisabled
    ).forEach((item) => {
      // only staff has staffID
      if ('positionId' in item) {
        if (!checkIfStaffDisabled(formatSelectValueForInternalStaff(item))) {
          listDecendantUnitAndStaffs.set(item.positionId, item)
        }
      } else {
        if (
          !checkIfUnitDisabled(formatSelectValueForInternalUnit(item)) &&
          !excludeDestinationList.has(item.id) &&
          !item?.isGroup &&
          !item?.containStaff
        )
          listDecendantUnitAndStaffs.set(item.id, item)
      }
    })

    // //group
    // if (subUnit?.isGroup) {
    //   subUnit?.subUnits?.forEach((unit) => {
    //     if (
    //       !checkIfUnitDisabled(formatSelectValueForInternalUnit(subUnit)) &&
    //       !excludeDestinationList.has(subUnit.id)
    //     ) {
    //       listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
    //     }
    //   })
    //   // role group
    // } else {
    //   if (
    //     !checkIfUnitDisabled(formatSelectValueForInternalUnit(subUnit)) &&
    //     !excludeDestinationList.has(subUnit.id)
    //     // (levelFromRoot === 0 || (levelFromRoot === 1 && unit?.isGroup))
    //   ) {
    //     listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
    //   }
    // }
    // unit
  })
  return listDecendantUnitAndStaffs
}

export const getAllEnableUnitsAndStaffsBelongToUnit = (
  unit: TTreeUnitWithStaffNode,
  excludeDestinationList: Map<string, TTreeUnitWithStaffNode>,
  checkIfUnitDisabled: (unit: TInUnitDestinationSelect) => boolean,
  checkIfStaffDisabled: (staff: TStaffDestinationSelect) => boolean
): Map<string, TTreeInternalItemNode> => {
  const listDecendantUnitAndStaffs = new Map<string, TTreeInternalItemNode>()
  // get all enable decendant units + staffs
  unit?.staffs?.forEach((staff) => {
    if (!checkIfStaffDisabled(formatSelectValueForInternalStaff(staff))) {
      listDecendantUnitAndStaffs.set(staff.positionId, staff)
    }
  })

  unit?.subUnits?.forEach((subUnit) => {
    // if (
    //   !checkIfUnitDisabled(formatSelectValueForInternalUnit(subUnit)) &&
    //   !excludeDestinationList.has(subUnit.id) &&
    //   !subUnit?.isGroup
    // )
    //   listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
    // getAllEnableUnitsAndStaffsBelongToUnit(
    //   subUnit,
    //   excludeDestinationList,
    //   checkIfUnitDisabled,
    //   checkIfStaffDisabled
    // ).forEach((item) => {
    //   // only staff has staffID
    //   if ('positionId' in item) {
    //     if (!checkIfStaffDisabled(formatSelectValueForInternalStaff(item))) {
    //       listDecendantUnitAndStaffs.set(item.positionId, item)
    //     }
    //   } else {
    //     if (
    //       !checkIfUnitDisabled(formatSelectValueForInternalUnit(item)) &&
    //       !excludeDestinationList.has(item.id)
    //     )
    //       listDecendantUnitAndStaffs.set(item.id, item)
    //   }
    // })

    // //group
    if (subUnit?.isGroup) {
      subUnit?.subUnits?.forEach((unit) => {
        if (
          !checkIfUnitDisabled(formatSelectValueForInternalUnit(unit)) &&
          !excludeDestinationList.has(unit.id) &&
          !unit?.isGroup &&
          !unit?.containStaff
        ) {
          listDecendantUnitAndStaffs.set(unit.id, unit)
        }
      })
    } else {
      if (
        !checkIfUnitDisabled(formatSelectValueForInternalUnit(subUnit)) &&
        !excludeDestinationList.has(subUnit.id) &&
        !subUnit?.containStaff
        // (levelFromRoot === 0 || (levelFromRoot === 1 && unit?.isGroup))
      ) {
        listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
      }
    }
    // unit
  })
  return listDecendantUnitAndStaffs
}

export const getAllChildStaffs = (
  unit: TTreeUnitWithStaffNode,
  checkIfStaffDisabled: (staff: TStaffDestinationSelect) => boolean
): Map<string, TTreeStaffNodeNew> => {
  const listDecendantStaffs = new Map<string, TTreeStaffNodeNew>()
  const levelFromRoot = unit?.levelFromRoot || 0

  unit?.staffs?.forEach((staff) => {
    if (
      !checkIfStaffDisabled(formatSelectValueForInternalStaff(staff)) &&
      (levelFromRoot === 0 || (levelFromRoot === 1 && unit?.isGroup))
    ) {
      listDecendantStaffs.set(staff.positionId, staff)
    }
  })
  return listDecendantStaffs
}

export const getListUnitThatNeedIncludeLeaderInDestination = (signFlow: TDocumentSignFlow) => {
  // const mustHasLeaderStepSignNames = [
  //   OD_SIGN_TYPES.leaderUnitSigner,
  //   OD_SIGN_TYPES.staffUnitSigner,
  //   OD_SIGN_TYPES.leaderCollaborator,
  //   OD_SIGN_TYPES.staffCollaborator
  // ] as TODSignTypes[]

  const listDirectorsInAllSignSteps = new Map<string, TSigner>()
  const unitsHasStaffInMustHasLeaderStepWithLeaderCheck = new Map<string, boolean>()

  //extract staff from all sign steps and staff must include leader
  signFlow?.forEach((step) => {
    if (
      step?.signType === OD_SIGN_TYPES.leaderUnitSigner ||
      step?.signType === OD_SIGN_TYPES.staffUnitSigner ||
      step?.signType === OD_SIGN_TYPES.leaderCollaborator ||
      step?.signType === OD_SIGN_TYPES.staffCollaborator
    ) {
      step?.staffs?.forEach((signerConfig) => {
        if (signerConfig?.staff) {
          if (
            signerConfig?.staff?.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
            signerConfig?.staff?.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead
          )
            listDirectorsInAllSignSteps.set(signerConfig?.staff?.positionId, signerConfig?.staff)
          // if (mustHasLeaderStepSignNames?.includes(step?.signType)) {
          // }
          unitsHasStaffInMustHasLeaderStepWithLeaderCheck.set(signerConfig?.staff?.unitId, false)
        }
      })
    } else {
      if (step?.staff) {
        if (
          step?.staff?.roleInUnit === ROLE_IN_UNIT_VALUES.director ||
          step?.staff?.roleInUnit === ROLE_IN_UNIT_VALUES.unitHead
        )
          listDirectorsInAllSignSteps.set(step?.staff?.positionId, step?.staff)
        // if (mustHasLeaderStepSignNames?.includes(step?.signType)) {
        // }
        unitsHasStaffInMustHasLeaderStepWithLeaderCheck.set(step?.staff?.unitId, false)
      }
    }
  })
  listDirectorsInAllSignSteps?.forEach((director) => {
    if (
      unitsHasStaffInMustHasLeaderStepWithLeaderCheck.has(director?.unitId) &&
      unitsHasStaffInMustHasLeaderStepWithLeaderCheck.get(director?.unitId) === false
    )
      unitsHasStaffInMustHasLeaderStepWithLeaderCheck.set(director?.unitId, true)
  })
  const listUnitIdThatNeedIncludeLeaderInDestination: string[] = []
  unitsHasStaffInMustHasLeaderStepWithLeaderCheck?.forEach((leaderIncluded, unitId) => {
    if (!leaderIncluded) listUnitIdThatNeedIncludeLeaderInDestination.push(unitId)
  })
  return listUnitIdThatNeedIncludeLeaderInDestination
}

export const transformDocDestinationsIntoTreeInput = (
  destinations: DestinationVM[]
): TFormSelectDestinationValues => {
  const formatedDestinaitons: TFormSelectDestinationValues = new Map()
  destinations?.forEach((destination) => {
    if (destination?.isUnitExternal) {
      formatedDestinaitons.set(destination?.id, {
        id: destination?.id,
        name: destination?.name,
        axisOrgId: destination?.axisOrgId,
        systemType: RECEIVER_SYSTEM_TYPES.external,
        type: RECEIVER_TYPES.UNIT,
        formName: destination?.role
      })
    } else if (destination?.destinationType === RECEIVER_TYPES.UNIT) {
      formatedDestinaitons.set(destination?.id, {
        id: destination?.id,
        name: destination?.name,
        systemType: RECEIVER_SYSTEM_TYPES.internal,
        type: RECEIVER_TYPES.UNIT,
        formName: destination?.role
      })
    } else {
      formatedDestinaitons.set(destination?.id, {
        id: destination?.id,
        name: destination?.name,
        systemType: RECEIVER_SYSTEM_TYPES.internal,
        type: RECEIVER_TYPES.STAFF,
        formName: destination?.role,
        roleInUnit: destination?.roleInUnit
      })
    }
  })
  return formatedDestinaitons
}
