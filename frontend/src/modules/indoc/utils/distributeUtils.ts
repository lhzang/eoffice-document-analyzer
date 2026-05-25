import { DOCUMENT_PROCESS_ROLES, RECEIVER_TYPES } from '@/shared/constants/document'
import type { TDistributeRole } from '@/shared/models/common'
import type {
  TTreeInternalItemNode,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import type { ReceiverDTO, ReceiverVM } from '@/shared/services/api'
import pick from 'lodash-es/pick'
import { type Ref } from 'vue'
import type {
  TDistributeUnitValueNoFormName,
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../models/types'

export const transformGetDistributeUnitValue = (
  unit: TTreeUnitWithStaffNode
): TDistributeUnitValueNoFormName => {
  return pick(unit, ['id', 'name', 'isGroup'])
}

export function autoSelectParentIfAllChildsSelectedTree(
  node: TTreeUnitWithStaffNode,
  selectedMapRef: Ref<Map<string, TFormSelectDistributeItemValue>>,
  checkboxInputnameList: TDistributeRole[],
  isPersonalDistribute: boolean,
  checkIfStaffDisabled: (staff: TSelectStaffDistributeValue) => boolean,
  checkIfUnitDisabled: (unit: TSelectUnitDistributeValue) => boolean
): Map<string, TTreeUnitWithStaffNode> {
  const selectedMap = selectedMapRef.value
  const listParentThatHasAllSubDisabled = new Map<string, TTreeUnitWithStaffNode>()
  // if ((!node?.isGroup || node.isRoleGroup) && isPersonalDistribute && node?.levelFromRoot !== 0) {
  //   return listParentThatHasAllSubDisabled
  // }
  //reach leaf first
  for (const sub of node.subUnits) {
    const subResultMap = autoSelectParentIfAllChildsSelectedTree(
      sub,
      selectedMapRef,
      checkboxInputnameList,
      isPersonalDistribute,
      checkIfStaffDisabled,
      checkIfUnitDisabled
    )
    for (const [key, value] of subResultMap) {
      listParentThatHasAllSubDisabled.set(key, value)
    }
  }
  //check current node after all leaf handled
  for (const inputName of checkboxInputnameList) {
    // when isPersonalDistribute mark functional unit(exclude root) as false
    //  so that when all subs tick it not auto tick unit
    let allChildrenSelected = isPersonalDistribute
      ? node?.isGroup || node?.levelFromRoot === 0
      : true

    let allChildrenDisabled =
      !!node.staffs.length || !!node.subUnits.length || listParentThatHasAllSubDisabled.has(node.id)

    const listDisabledInputNameOfSubItems = new Set<TDistributeRole>()
    for (const unit of node.subUnits) {
      const selected = selectedMap.get(unit.id)
      const isDisabled = checkIfUnitDisabled(formatDistributeValueInputForUnit(unit))
      const isIncludedInAutoCheckedList = listParentThatHasAllSubDisabled.has(unit.id)
      if (!isDisabled && !isIncludedInAutoCheckedList) {
        allChildrenDisabled = false
      }
      if (selected?.formName !== inputName && !isDisabled && !isIncludedInAutoCheckedList) {
        allChildrenSelected = false
      }
      if (selected?.formName && (isDisabled || isIncludedInAutoCheckedList)) {
        listDisabledInputNameOfSubItems.add(selected.formName)
      }
    }
    if (allChildrenSelected) {
      for (const staff of node.staffs) {
        const selected = selectedMap.get(staff.positionId)
        const isDisabled = checkIfStaffDisabled(formatDistributeValueInputForStaff(staff))

        if (!isDisabled) {
          if (selected?.formName) listDisabledInputNameOfSubItems.add(selected.formName)
          allChildrenDisabled = false
        }
        if (
          selected?.formName !== inputName &&
          !checkIfStaffDisabled(formatDistributeValueInputForStaff(staff))
        ) {
          allChildrenSelected = false
        }
        if (isDisabled && selected?.formName) listDisabledInputNameOfSubItems.add(selected.formName)
      }
    }
    if (allChildrenSelected && (node.subUnits.length || node.staffs.length)) {
      if (allChildrenDisabled) {
        if (
          listDisabledInputNameOfSubItems.size === 1 &&
          checkboxInputnameList.includes(listDisabledInputNameOfSubItems.values().next().value!)
        ) {
          selectedMap.set(node.id, {
            ...transformGetDistributeUnitValue(node),
            type: RECEIVER_TYPES.UNIT,
            formName: listDisabledInputNameOfSubItems.values().next().value!
          })
        }
      } else {
        selectedMap.set(node.id, {
          ...transformGetDistributeUnitValue(node),
          type: RECEIVER_TYPES.UNIT,
          formName: inputName
        })
      }
    }
    // Add to listParentThatHasAllSubDisabled if all children are disabled and formName exists
    if (allChildrenDisabled && inputName) {
      listParentThatHasAllSubDisabled.set(node.id, node)
    }
  }
  // console.log(listParentThatHasAllSubDisabled, 'listParentThatHasAllSubDisabled')
  return listParentThatHasAllSubDisabled
}

export function autoSelectParentIfAllChildsSelectedForest(
  roots: TTreeUnitWithStaffNode[],
  selectedMapRef: Ref<Map<string, TFormSelectDistributeItemValue>>,
  checkboxInputnameList: TDistributeRole[],
  isPersonalDistribute: boolean,
  checkIfStaffDisabled: (staff: TSelectStaffDistributeValue) => boolean,
  checkIfUnitDisabled: (unit: TSelectUnitDistributeValue) => boolean
): Map<string, TTreeUnitWithStaffNode> {
  const listParentThatHasAllSubDisabled = new Map<string, TTreeUnitWithStaffNode>()

  for (const root of roots) {
    const listParentThatHasAllSubDisabledFromTree = autoSelectParentIfAllChildsSelectedTree(
      root,
      selectedMapRef,
      checkboxInputnameList,
      isPersonalDistribute,
      checkIfStaffDisabled,
      checkIfUnitDisabled
    )
    for (const [k, v] of listParentThatHasAllSubDisabledFromTree)
      listParentThatHasAllSubDisabled.set(k, v)
  }

  return listParentThatHasAllSubDisabled
}

export function getDisplayValueForDistributeRole(role: TDistributeRole) {
  switch (role) {
    case DOCUMENT_PROCESS_ROLES.Leader:
      return 'Chủ trì'
    case DOCUMENT_PROCESS_ROLES.Director:
      return 'Chỉ đạo'
    case DOCUMENT_PROCESS_ROLES.Collaborator:
      return 'Phối hợp'
    default:
      return 'Xem để biết'
  }
}

export function getGroupDistributedItemsByRole(distributedItems: TFormSelectDistributeItemValue[]) {
  const groupedItem: Record<TDistributeRole, TFormSelectDistributeItemValue[]> = {
    [DOCUMENT_PROCESS_ROLES.Director]: [],
    [DOCUMENT_PROCESS_ROLES.Leader]: [],
    [DOCUMENT_PROCESS_ROLES.Collaborator]: [],
    [DOCUMENT_PROCESS_ROLES.Viewer]: []
  }
  distributedItems?.forEach((item) => groupedItem?.[item.formName]?.push(item))
  return groupedItem
}

//format data form selectedValue, exclude group and root unit of tree
export const getFormatValueDistribute = (values: TFormSelectDistributeItemValue[]): ReceiverDTO[] =>
  values
    ?.filter(
      (distributeItem) =>
        distributeItem?.type === RECEIVER_TYPES.STAFF ? true : !distributeItem?.isGroup
      // distributeItem?.parentUnit !== null
    )
    .map((distributedItem) => ({
      id: distributedItem.id,
      role: distributedItem.formName,
      type: distributedItem?.type
    }))

export const formatDistributeValueInputForStaff = (
  staff: TTreeStaffNodeNew
): TSelectStaffDistributeValue => ({
  id: staff?.positionId,
  name: staff?.displayName,
  type: RECEIVER_TYPES.STAFF
})
export const formatDistributeValueInputForUnit = (
  unit: TTreeUnitWithStaffNode
): TSelectUnitDistributeValue => ({
  id: unit?.id,
  name: unit?.name,
  type: RECEIVER_TYPES.UNIT,
  isGroup: unit?.isGroup
})
export const gettFormatValueFromRelevantActors = (
  actors: ReceiverVM[]
): Map<string, TFormSelectDistributeItemValue> => {
  const map = new Map<string, TFormSelectDistributeItemValue>()
  actors.forEach((actor) => {
    map.set(
      actor.id,
      actor.type === RECEIVER_TYPES.STAFF
        ? {
            id: actor.id,
            name: actor.displayName,
            type: actor.type,
            formName: actor.role
          }
        : {
            id: actor.id,
            name: actor.displayName,
            type: actor.type,
            isGroup: false,
            formName: actor.role
          }
    )
  })
  return map
}

export const getAllEnableDecendantUnitsAndStaffs = (
  unit: TTreeUnitWithStaffNode,
  initialUnitIDList: Set<string>,
  readOnlyItems: Map<string, TFormSelectDistributeItemValue>,
  checkIfUnitDisabled: (unit: TSelectUnitDistributeValue) => boolean,
  checkIfStaffDisabled: (staff: TSelectStaffDistributeValue) => boolean
): Map<string, TTreeInternalItemNode> => {
  const listDecendantUnitAndStaffs = new Map<string, TTreeInternalItemNode>()
  // get all enable decendant units + staffs
  if (unit?.isGroup && initialUnitIDList?.has(unit?.id)) {
    unit?.staffs?.forEach((staff) => {
      // check if in readOnly list to filter
      const matchReadOnlytItem = readOnlyItems?.get(staff?.positionId)
      if (
        !checkIfStaffDisabled(formatDistributeValueInputForStaff(staff)) &&
        (!matchReadOnlytItem || matchReadOnlytItem?.type !== RECEIVER_TYPES.STAFF)
      ) {
        listDecendantUnitAndStaffs.set(staff.positionId, staff)
      }
    })

    unit?.subUnits?.forEach((subUnit) => {
      const matchReadOnlytItem = readOnlyItems?.get(unit?.id)
      // console.log(
      //   subUnit,
      //   unit,
      //   !checkIfUnitDisabled(formatDistributeValueInputForUnit(subUnit)),
      //   !matchReadOnlytItem || matchReadOnlytItem?.type !== RECEIVER_TYPES.UNIT,
      //   !initialUnitIDList.has(subUnit?.id),
      //   !subUnit?.isGroup,
      //   initialUnitIDList,
      //   subUnit?.id,

      //   'asfdasfdsdfasdfaasdf'
      // )
      // check if in readonly list or in in
      if (
        !checkIfUnitDisabled(formatDistributeValueInputForUnit(subUnit)) &&
        (!matchReadOnlytItem || matchReadOnlytItem?.type !== RECEIVER_TYPES.UNIT) &&
        initialUnitIDList.has(subUnit?.id) &&
        !subUnit?.isGroup
      ) {
        listDecendantUnitAndStaffs.set(subUnit.id, subUnit)
      }
      if (subUnit?.isGroup) {
        getAllEnableDecendantUnitsAndStaffs(
          subUnit,
          initialUnitIDList,
          readOnlyItems,
          checkIfUnitDisabled,
          checkIfStaffDisabled
        ).forEach((item) => {
          // only staff has staffID
          if ('positionId' in item) {
            if (!checkIfStaffDisabled(formatDistributeValueInputForStaff(item))) {
              listDecendantUnitAndStaffs.set(item.positionId, item)
            }
          } else {
            if (!checkIfUnitDisabled(formatDistributeValueInputForUnit(item)))
              listDecendantUnitAndStaffs.set(item.id, item)
          }
        })
      }
    })
  } else return listDecendantUnitAndStaffs

  return listDecendantUnitAndStaffs
}

export const extractUnitFromForest = (forest: TTreeUnitWithStaffNode[]) => {
  const unitList: TTreeUnitWithStaffNode[] = []
  const dfs = (node: TTreeUnitWithStaffNode) => {
    unitList.push(node)
    if (node.subUnits?.length) {
      for (const child of node.subUnits) {
        dfs(child)
      }
    }
  }

  for (const root of forest) {
    dfs(root)
  }

  return unitList
}

export const formatSelectValueForUnit = (
  unit: TTreeUnitWithStaffNode
): TSelectUnitDistributeValue => ({
  id: unit?.id,
  name: unit?.name,
  type: RECEIVER_TYPES.UNIT,
  isGroup: unit?.isGroup
})
export const formatSelectValueForStaff = (
  staff: TTreeStaffNodeNew
): TSelectStaffDistributeValue => ({
  id: staff.positionId,
  name: staff.displayName,
  type: RECEIVER_TYPES.STAFF
})
