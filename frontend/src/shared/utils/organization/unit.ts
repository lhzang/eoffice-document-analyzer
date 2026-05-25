import { DEFAULT_RANK } from '@/shared/constants/common'
import type { TStaffLeaderFilterMode } from '@/shared/models/common'
import type { AdminUnitVM, StaffVM } from '@/shared/services/api'
import omit from 'lodash-es/omit'
import pick from 'lodash-es/pick'
import type {
  TGroupWithoutUnitVM,
  TMarkedUnitVM,
  TStaffAndUnitSelectTab,
  TStaffSelectValue,
  TStaffVM,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffCheckNode,
  TTreeUnitWithStaffNode,
  TUnitSelectValue,
  TUnitVM
} from '../../models/organization/unit'
import { cleanObject, pickStrict } from '../common'
import { ROLE_IN_UNIT_VALUES } from './../../constants/common'

export const getUnitById = (
  id: string,
  rootUnit: TTreeUnitWithStaffNode
): TTreeUnitWithStaffNode | undefined => {
  if (rootUnit.id === id) return rootUnit

  for (const subUnit of rootUnit.subUnits ?? []) {
    const foundUnit = getUnitById(id, subUnit)
    if (foundUnit) return foundUnit
  }

  return undefined
}

export const getStaffByPositionId = (
  positionId: string,
  rootUnit: TTreeUnitWithStaffNode
): TTreeStaffNodeNew | undefined => {
  for (const staff of rootUnit.staffs ?? []) {
    if (staff.positionId === positionId) return staff
  }

  for (const subUnit of rootUnit.subUnits ?? []) {
    const foundStaff = getStaffByPositionId(positionId, subUnit)
    if (foundStaff) return foundStaff
  }

  return undefined
}
// just get real unit (groups create from role excluded)
export const getAncestorUnits = (
  id: string, // this can be id of unit or positionId of staff
  rootUnit: TTreeUnitWithStaffNode,
  isDecendant?: boolean
): TTreeUnitWithStaffNode[] => {
  const listUnitUpToDown: TTreeUnitWithStaffNode[] = []

  const findAncestors = (currentUnit: TTreeUnitWithStaffNode, targetId: string): boolean => {
    if (currentUnit.id === targetId) {
      return true
    }
    if (currentUnit?.staffs?.find((staff) => staff.positionId === targetId)) {
      if (!currentUnit?.isRoleGroup) listUnitUpToDown.push(currentUnit)
      return true
    }
    for (const subUnit of currentUnit.subUnits ?? []) {
      if (findAncestors(subUnit, targetId)) {
        listUnitUpToDown.push(currentUnit)
        return true
      }
    }
    return false
  }

  findAncestors(rootUnit, id)
  if (isDecendant) return listUnitUpToDown.reverse()
  return listUnitUpToDown
}

// merge branch into original tree,
// levelFromRoot of replace branch count from 0
// so need to update base on orginal tree to merge
// Note: Old version, double check and use if match current logic
export function updateNewTreeNode(
  rootUnit: TTreeUnitWithStaffNode,
  replacedUnitId: string,
  newValue: TTreeUnitWithStaffNode
) {
  function replaceAndUpdateLvFromRoot(
    node: TTreeUnitWithStaffNode,
    replacedUnitId: string,
    newValue: TTreeUnitWithStaffNode
  ): TTreeUnitWithStaffNode {
    if (node.id === replacedUnitId) {
      const replacedLevel = node.levelFromRoot ?? 0
      const updatedLevelFromRoot = (newValue.levelFromRoot ?? 0) + replacedLevel
      return {
        ...node,
        ...newValue,
        levelFromRoot: updatedLevelFromRoot,
        subUnits:
          newValue.subUnits?.map((subUnit) => updateSubUnitLevels(subUnit, updatedLevelFromRoot)) ??
          []
      }
    }

    return {
      ...node,
      subUnits:
        node.subUnits?.map((subUnit) =>
          replaceAndUpdateLvFromRoot(subUnit, replacedUnitId, newValue)
        ) ?? []
    }
  }

  function updateSubUnitLevels(
    subUnit: TTreeUnitWithStaffNode,
    parentLevelFromRoot: number
  ): TTreeUnitWithStaffNode {
    const updatedLevelFromRoot = parentLevelFromRoot + 1
    return {
      ...subUnit,
      levelFromRoot: updatedLevelFromRoot,
      subUnits:
        subUnit.subUnits?.map((childSubUnit) =>
          updateSubUnitLevels(childSubUnit, updatedLevelFromRoot)
        ) ?? []
    }
  }

  return replaceAndUpdateLvFromRoot(rootUnit, replacedUnitId, newValue)
}

export const replaceTreeNode = (
  rootUnit: TTreeUnitWithStaffNode,
  replacedUnitId: string,
  updatedUnitValue: TTreeUnitWithStaffNode
): TTreeUnitWithStaffNode => {
  if (rootUnit.id === replacedUnitId) return updatedUnitValue

  if (!rootUnit.subUnits?.length) return rootUnit

  const updatedSubUnits = rootUnit.subUnits.map((sub) =>
    sub.id === replacedUnitId
      ? updatedUnitValue
      : replaceTreeNode(sub, replacedUnitId, updatedUnitValue)
  )
  return { ...rootUnit, subUnits: updatedSubUnits }
}

export const generateParentUnitMetadata = (unit: TTreeUnitWithStaffNode) => ({
  rank: unit?.rank,
  id: unit?.id,
  name: unit?.name
})

export const updateStaffDataOnlyToNodeOfForest = (
  forest: TTreeUnitWithStaffNode[],
  fetchedUnit: TTreeUnitWithStaffNode,
  staffList: TStaffVM[]
) => {
  if (!staffList?.length) return

  // Process data and merge into current forest
  const treeOfUpdateNode = forest?.find((treeNode) => treeNode?.id === fetchedUnit?.rootNodeId)
  if (!treeOfUpdateNode) return

  let patchedUnit = getUnitById(fetchedUnit?.id, treeOfUpdateNode)
  if (!patchedUnit) return
  const listStaffsNotNeedToGroup: TTreeStaffNodeNew[] = []
  const createdGroupFromStaff: Map<string, TTreeUnitWithStaffNode> = new Map()

  staffList?.forEach((staff) => {
    if (staff?.groups?.length) {
      listStaffsNotNeedToGroup.push({
        ...omit(staff, ['groups']),
        parentUnit: generateParentUnitMetadata(fetchedUnit),
        groupIds: []
      })
    } else {
      if (staff?.groups?.length) {
        staff?.groups?.forEach((group) => {
          const groupFromUserRole = createdGroupFromStaff.get(`${group.id}`)
          if (groupFromUserRole) {
            groupFromUserRole.staffs = [
              ...groupFromUserRole.staffs,
              {
                ...omit(staff, ['groups']),
                parentUnit: generateParentUnitMetadata(fetchedUnit),
                groupIds: staff.groups?.map((group) => `${group.id}_${fetchedUnit.id}`)
              }
            ]
          } else {
            const groupFromStaffValue = {
              id: `${group.id}_${fetchedUnit?.id}`,
              name: group.name,
              rank: group.rank,
              isGroup: true,
              isRoleGroup: true,
              relativeLevel: (patchedUnit?.levelFromRoot ?? 0) + 1,
              levelFromRoot: (patchedUnit?.levelFromRoot ?? 0) + 1,
              staffs: [
                {
                  ...omit(staff, ['groups']),
                  parentUnit: generateParentUnitMetadata(fetchedUnit),
                  groupIds: staff.groups?.map((group) => `${group.id}_${fetchedUnit?.id}`)
                }
              ],
              containStaff: true,
              subUnits: [],
              rootNodeId: patchedUnit?.rootNodeId || treeOfUpdateNode?.id,
              parentUnit: generateParentUnitMetadata(fetchedUnit),
              group: null
            }
            createdGroupFromStaff.set(`${group.id}`, groupFromStaffValue)
          }
        })
      } else {
        listStaffsNotNeedToGroup.push({
          ...omit(staff, ['groups']),
          parentUnit: generateParentUnitMetadata(fetchedUnit)
        })
      }
    }
  })

  listStaffsNotNeedToGroup?.sort((a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK))

  createdGroupFromStaff?.forEach((group) => ({
    ...group,
    staffs: group?.staffs?.sort((a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK))
  }))
  const listGroupsFromStaff = Array.from(createdGroupFromStaff?.values())

  patchedUnit = {
    ...patchedUnit,
    staffs: listStaffsNotNeedToGroup,
    subUnits: [...listGroupsFromStaff, ...patchedUnit?.subUnits]
  }

  const patchedTreeNode = replaceTreeNode(treeOfUpdateNode, patchedUnit?.id, patchedUnit)
  const patchTreeNodeIdx = forest?.findIndex((tree) => tree?.id === patchedTreeNode?.id)
  if (patchTreeNodeIdx !== -1) forest?.splice(patchTreeNodeIdx, 1, patchedTreeNode)

  return forest
}

// Show filtered units and users with their ancestor
export const filterTreeNodeByName = (
  nodeData: TTreeUnitWithStaffNode,
  isAllowSearchUser: boolean,
  searchValue?: string
): TTreeUnitWithStaffNode | null => {
  if (!searchValue?.trim()) return nodeData
  const isMatch = nodeData.name?.toLowerCase().includes(searchValue?.toLowerCase())
  const filteredUsers = isAllowSearchUser
    ? nodeData?.staffs?.filter((staff) => staff?.displayName?.toLowerCase().includes(searchValue))
    : (nodeData?.staffs ?? [])
  // Filter subUnits recursively
  const filteredSubUnits = []
  if (nodeData.subUnits && nodeData.subUnits.length > 0) {
    for (const subUnit of nodeData.subUnits) {
      const filteredSubUnit = filterTreeNodeByName(subUnit, isAllowSearchUser, searchValue)
      if (filteredSubUnit) {
        filteredSubUnits.push(filteredSubUnit)
      }
    }
  }
  // If the current node matches or any of its children match, include this node
  if (
    nodeData.relativeLevel < 2 ||
    isMatch ||
    filteredSubUnits.length > 0 ||
    filteredUsers.length > 0
  ) {
    if (nodeData.relativeLevel === 0)
      return { ...nodeData, subUnits: filteredSubUnits, staffs: filteredUsers }
    if (filteredSubUnits.length > 0 || isMatch) {
      return {
        ...nodeData,
        subUnits: filteredSubUnits,
        staffs: filteredUsers
      }
    } else
      return {
        ...nodeData,
        subUnits: filteredSubUnits,
        staffs: filteredUsers
      }
  }
  // If no match found in the current node or its subUnits, return null
  return null
}

export const transformGetSelectUnitValue = (unit: TTreeUnitWithStaffNode): TUnitSelectValue => {
  return pick(unit, ['id', 'name'])
}
export const transformGetStaffSelectValue = (staff: TTreeStaffNodeNew): TStaffSelectValue => {
  return {
    positionId: staff?.positionId,
    displayName: staff?.displayName,
  }
}

export const getStaffAndUnitSelectTabLabel = (tabValue: TStaffAndUnitSelectTab) => {
  if (tabValue === 'EXTERNAL_TAB') return 'Đơn vị bên ngoài'
  if (tabValue === 'HMUH_EXTERNAL_TAB') return 'Đại học Y Hà Nội'
  if (tabValue === 'INTERNAL_TAB') return 'Đơn vị nội bộ'
}

const normalizeNode = (
  node: TTreeUnitWithStaffCheckNode,
  relativeLevel: number,
  unitLevel: number,
  rootNodeId: string
): TTreeUnitWithStaffNode => {
  const sortedStaff = [...node?.staffs]?.sort(
    (a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK)
  )
  const distincUnits: Record<'fromRole' | 'fromGroup' | 'fromUnit', TTreeUnitWithStaffCheckNode[]> =
  {
    fromRole: [],
    fromGroup: [],
    fromUnit: []
  }
  node?.subUnits?.forEach((subUnit) => {
    if (subUnit?.isRoleGroup) distincUnits?.fromRole.push(subUnit)
    else if (subUnit?.isGroup) distincUnits?.fromGroup.push(subUnit)
    else distincUnits?.fromUnit.push(subUnit)
  })

  //sort 3 kind of unit (create from user role, unit group, unit)
  const sortedRoleGroups = [...distincUnits.fromRole].sort(
    (a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK)
  )
  const sortedGroups = [...distincUnits.fromGroup].sort(
    (a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK)
  )
  const sortedUnits = [...distincUnits.fromUnit].sort(
    (a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK)
  )

  //increase relative level by level of node,
  //unitLevel only increase when node is actual unit
  //(not from user roles or groups)
  return {
    ...pickStrict(node, ['id', 'name', 'parentUnit', 'rank', 'isGroup', 'isRoleGroup']),
    staffs: [...sortedStaff],
    subUnits: [
      ...sortedRoleGroups.map((roleGroup) =>
        normalizeNode(
          roleGroup,
          relativeLevel + 1,
          node?.isGroup ? unitLevel : unitLevel + 1,
          rootNodeId
        )
      ),
      ...sortedGroups.map((roleGroup) =>
        normalizeNode(
          roleGroup,
          relativeLevel + 1,
          node?.isGroup ? unitLevel : unitLevel + 1,
          rootNodeId
        )
      ),
      ...sortedUnits.map((roleGroup) =>
        normalizeNode(
          roleGroup,
          relativeLevel + 1,
          node?.isGroup ? unitLevel : unitLevel + 1,
          rootNodeId
        )
      )
    ],
    containStaff: !!sortedStaff?.length || !!sortedRoleGroups?.length,
    rootNodeId: rootNodeId,
    relativeLevel: relativeLevel,
    levelFromRoot: unitLevel
  }
}

export const buildUnitForestFromUnitAndStaffList = (
  originalUnitsList: TUnitVM[],
  staffsList: TStaffVM[],
  groupsWithNoUnit?: TGroupWithoutUnitVM[],
  relativeLevel?: number,
  unitLevel?: number
) => {
  const modifiedUnitList: TMarkedUnitVM[] = originalUnitsList?.map((unit) => ({
    ...unit,
    isOriginalUnit: true
  }))
  //group staffs by unitId for implement in unit later
  const groupedStaffByUnit = new Map<string, TStaffVM[]>()
  //this save all nodes from units/groups
  const allUnitNodes = new Map<string, TTreeUnitWithStaffCheckNode>()
  //forest of final trees
  const treeForest: Array<TTreeUnitWithStaffNode> = []

  //handle staff first
  staffsList
    ?.filter((staff) => staff?.roleInUnit !== 'ADMIN')
    .forEach((staff) => {
      const staffUnit = groupedStaffByUnit.get(staff?.parentUnit?.id)
      // add unit that not in originallist and created by staff
      if (
        !modifiedUnitList?.find((unit) => unit?.id === staff?.parentUnit?.id) &&
        staff?.parentUnit?.id
      ) {
        modifiedUnitList.push({
          ...staff.parentUnit,
          parentUnit: null,
          group: null,
          isOriginalUnit: false
        })
      }
      //add staff to existed unit or create new
      if (staffUnit) {
        staffUnit.push(staff)
      } else {
        groupedStaffByUnit.set(staff?.parentUnit?.id, [staff])
      }
    })
  //add staffs into unit node
  const addedUsersUnitList = modifiedUnitList?.map((unit) => ({
    ...unit,
    staffs: groupedStaffByUnit.get(unit?.id) ?? []
  }))

  //build tree first -> then sort + attach level,
  //not handle sort or attach level when build tree

  //handle staffs stuff
  //loop => get parent node from unit
  //transform staff unit data into group UI(if needed)
  addedUsersUnitList?.forEach((unit) => {
    // the map to save group from user
    // and the array is for no group user
    const listStaffsNotNeedToGroup: TTreeStaffNodeNew[] = []
    const createdGroupFromStaff: Map<string, TTreeUnitWithStaffCheckNode> = new Map()
    unit?.staffs?.forEach((staff) => {
      if (staff?.groups?.length) {
        staff?.groups?.forEach((group) => {
          const groupFromUserRole = createdGroupFromStaff.get(`${group.id}`)
          if (groupFromUserRole) {
            groupFromUserRole.staffs = [
              ...groupFromUserRole.staffs,
              {
                ...omit(staff, ['groups']),
                groupIds: staff.groups?.map((group) => `${group.id}_${staff.parentUnit.id}`)
              }
            ]
          } else {
            const groupFromStaffValue = {
              id: `${group.id}_${unit?.id}`,
              name: group.name,
              rank: group.rank,
              isGroup: true,
              isRoleGroup: true,
              relativeLevel: 0,
              levelFromRoot: 0,
              staffs: [
                {
                  ...omit(staff, ['groups']),
                  unitId: staff.parentUnit.id,
                  groupIds: staff.groups?.map((group) => `${group.id}_${staff.parentUnit.id}`)
                }
              ],
              subUnits: [],
              parentUnit: staff.parentUnit,
              group: null
            }
            createdGroupFromStaff.set(`${group.id}`, groupFromStaffValue)
          }
        })
      } else {
        listStaffsNotNeedToGroup.push({
          ...omit(staff, ['groups'])
        })
      }
    })
    const staffHandledUnit: TTreeUnitWithStaffCheckNode = {
      ...omit(unit, 'isOriginalUnit'),
      staffs: listStaffsNotNeedToGroup,
      subUnits: Array.from(createdGroupFromStaff.values()),
      isGroup: !unit?.isOriginalUnit,
      isRoleGroup: false,
      relativeLevel: 0,
      levelFromRoot: 0
    }
    allUnitNodes.set(unit?.id, {
      ...staffHandledUnit
    })
  })
  //create full nodes in tree
  for (const node of allUnitNodes.values()) {
    const nodeParentGroup = node?.group
    const nodeParentUnit = node?.parentUnit

    // build tree from unit, if unit exist in original array
    // then push to subunit, if not create mark as isGroup
    // by checking that unit created from unit or group
    // when build tree group is prior over unit to build parent node
    // if not have group then use parentUnit
    // Ex: Parent(uni) -> group of children(office group) -> children(uni office)
    if (nodeParentGroup) {
      const updateNode = allUnitNodes.get(nodeParentGroup.id)
      if (updateNode) {
        updateNode.subUnits.push(node)
      } else {
        allUnitNodes.set(nodeParentGroup.id, {
          id: nodeParentGroup.id,
          name: nodeParentGroup.name,
          relativeLevel: 0,
          levelFromRoot: 0,
          isGroup: true,
          isRoleGroup: false,
          subUnits: [node],
          staffs: [],
          rank: nodeParentGroup.rank,
          parentUnit: nodeParentUnit,
          group: null
        })
      }
    } else if (nodeParentUnit) {
      const updateNode = allUnitNodes.get(nodeParentUnit.id)
      if (updateNode) {
        updateNode.subUnits.push(node)
      } else {
        allUnitNodes.set(nodeParentUnit.id, {
          id: nodeParentUnit.id,
          name: nodeParentUnit.name,
          relativeLevel: 0,
          levelFromRoot: 0,
          isGroup: true,
          isRoleGroup: false,
          subUnits: [node],
          staffs: [],
          rank: nodeParentUnit?.rank,
          group: null,
          parentUnit: null
        })
      }
    }
  }
  if (groupsWithNoUnit?.length) {
    groupsWithNoUnit?.forEach((group) => {
      const parentUnit = allUnitNodes.get(group.unitId)
      const formatedGroup = {
        id: group.id,
        name: group.name,
        relativeLevel: 0,
        levelFromRoot: 0,
        isGroup: true,
        isRoleGroup: false,
        subUnits: [],
        staffs: [],
        rank: group.rank,
        parentUnit: parentUnit
          ? {
            name: parentUnit?.name,
            id: parentUnit?.id,
            rank: parentUnit?.rank
          }
          : null,
        group: null
      }
      allUnitNodes.set(group.id, formatedGroup)
      if (parentUnit) parentUnit.subUnits.push(formatedGroup)
    })
  }
  //split root nodes from node list to get final forest, sort and arrange trees in forest
  for (const node of allUnitNodes.values()) {
    if (!node?.parentUnit && !node?.group) {
      treeForest.push(normalizeNode(node, relativeLevel ?? 0, unitLevel ?? 0, node?.id))
    }
  }
  return treeForest?.sort((a, b) => (a.rank ?? DEFAULT_RANK) - (b.rank ?? DEFAULT_RANK))
}

export const formatAdminUnitDataForTreeInput = (units: AdminUnitVM[]): TUnitVM[] =>
  units?.map((unit) => ({
    id: unit.id,
    name: unit.name,
    parentUnit: unit?.parentUnit ?? null,
    rank: unit?.rank,
    group: unit?.group ?? null
  }))

// full-detail mapping for unit to support forms (keeps additional fields like shortName)
export const formatAdminUnitDataForForm = (units: AdminUnitVM[]): TUnitVM[] =>
  (units ?? [])?.map((unit) => ({
    id: unit.id,
    name: unit.name,
    shortName: unit?.shortName,
    parentUnit: unit?.parentUnit ?? null,
    rank: unit?.rank,
    group: unit?.group ?? null
  }))

// full-detail mapping for forms; keeps extra fields alongside tree-minimal ones
export const formatAdminStaffDataForForm = (staffs: AdminUserVM[]): TStaffVM[] =>
  staffs?.map((staff) => ({
    positionId: staff.positionId,
    accountId: staff.accountId,
    displayName: staff.displayName,
    parentUnit:
      cleanObject({
        id: staff?.unitId,
        name: staff?.unitName,
        rank: staff?.unitRank
      }) ?? null,
    rank: staff?.rank,
    groups: staff?.groups ?? null,
    fullName: staff?.fullName,
    email: staff?.email,
    phone: staff?.phone,
    title: staff?.title,
    start: staff?.start,
    end: staff?.end
  }))
export const formatInAllUnitStaffDataForTreeInput = (
  staffs: StaffVM[],
  unitId: string
): TStaffVM[] => {
  const formatedStaffs: TStaffVM[] = []
  for (const staff of staffs) {
    staff?.positions
      ?.filter((position) => position?.unitId === unitId)
      .forEach((position) => {
        const rolesAsGroup = position?.roles?.filter((role) => role?.displayedAsGroup)
        formatedStaffs.push({
          positionId: position?.id,
          accountId: staff?.id,
          displayName: position?.titleAbbr?.trim()
            ? `${position?.titleAbbr?.trim()} ${staff?.fullName}`
            : staff?.fullName,
          parentUnit:
            cleanObject({
              id: position?.unitId,
              name: position?.unitName,
              rank: position?.unitRank ?? 1
            }) ?? null,
          roleInUnit: position?.roleInUnit,
          rank: position?.rank,
          groups: rolesAsGroup?.length
            ? rolesAsGroup?.map((role) => ({
              id: role?.id,
              name: role?.title,
              rank: role?.rank
            }))
            : []
        })
      })
  }
  console.log(formatedStaffs, 'formatedStaffs')
  return formatedStaffs
}

export /**
 *
 *
 * @param {StaffVM[]} staffs: list staff
 * @param {TStaffLeaderFilterMode} [filterLeaderMode] filter to show match role in unit staff
 * @return {*}  {TStaffVM[]}
 */
  const formatAdminStaffDataForTreeInput = (
    staffs: StaffVM[],
    filterLeaderMode?: TStaffLeaderFilterMode
  ): TStaffVM[] => {
    const formatedStaffs: TStaffVM[] = []
    for (const staff of staffs ?? []) {
      staff?.positions.forEach((position) => {
        const rolesAsGroup = position?.roles?.filter((role) => role?.displayedAsGroup)
        const staffData = {
          positionId: position?.id,
          accountId: staff?.id,
          displayName: position?.titleAbbr?.trim()
            ? `${position?.titleAbbr?.trim()} ${staff?.fullName}`
            : staff?.fullName,
          parentUnit:
            cleanObject({
              id: position?.unitId,
              name: position?.unitName,
              rank: position?.unitRank ?? 1
            }) ?? null,
          roleInUnit: position?.roleInUnit,
          rank: position?.rank,
          groups: rolesAsGroup?.length
            ? rolesAsGroup?.map((role) => ({
              id: role?.id,
              name: role?.title,
              rank: role?.rank
            }))
            : []
        }
        //filter staff director or vice if need
        if (
          !filterLeaderMode ||
          (filterLeaderMode === 'DIRECTOR' &&
            (position?.roleInUnit === ROLE_IN_UNIT_VALUES?.admin ||
              position?.roleInUnit === ROLE_IN_UNIT_VALUES?.unitHead)) ||
          (filterLeaderMode === 'DIRECTOR_AND_VICE' &&
            (position?.roleInUnit === ROLE_IN_UNIT_VALUES?.admin ||
              position?.roleInUnit === ROLE_IN_UNIT_VALUES?.unitHead ||
              position?.roleInUnit === ROLE_IN_UNIT_VALUES?.unitDeputy))
        )
          formatedStaffs.push(staffData)
      })
    }
    return formatedStaffs
  }
