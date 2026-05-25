<script setup lang="ts">
import { useActionGetDirectChildrenAndStaffsInUnit } from '@/modules/organization/composables/queries/useActionGetDirectChildrenAndStaffsInUnit'
import {
  RECEIVER_TYPES,
  type TDocumentProcess,
  type TDocumentProcessRole,
  type TFormSelectProcessDoc
} from '@/shared/constants/document'
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import {
  filterTreeNodeByName,
  getStaffByPositionId,
  getUnitById,
  replaceTreeNode
} from '@/shared/utils/organization/unit'
import { useQueryClient } from '@tanstack/vue-query'
import { breakpointsTailwind, useBreakpoints, useDebounceFn } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { Checkbox, RadioButton } from 'primevue'
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { useGetTreeAssignInternalUnit } from '../../composables/queries/useGetTreeAssignInternalUnit'
import type {
  TFormSelectDistribute,
  TFormSelectDistributeItemValue,
  TSelectStaffDistributeValue,
  TSelectUnitDistributeValue
} from '../../models/types'
import {
  extractUnitFromForest,
  formatDistributeValueInputForStaff,
  formatDistributeValueInputForUnit,
  getAllEnableDecendantUnitsAndStaffs,
  // autoSelectParentIfAllChildsSelected,
  transformGetDistributeUnitValue
} from '../../utils/distributeUtils'
import GroupDistributeNode from './GroupDistributeNode.vue'
import UnitDistributeNode from './UnitDistributeNode.vue'

type TProps = {
  isPersonalDistribute?: boolean
  fetchQuerykey?: string
  // use for distribute/proposal for show not allow when not personal distribute
  isDistribute?: boolean
  availableRoles: TDocumentProcess[]
  formInputList: TFormSelectProcessDoc[]
  isGettingFlow: boolean
  isGettingSystemConfigInfo: boolean
  treeClass?: string
  preSelectValue?: Map<string, TFormSelectDistributeItemValue>
  isLoadingData?: boolean
  checkIfUnitDisabled?: (unit: TSelectUnitDistributeValue) => boolean
  checkIfStaffDisabled?: (staff: TSelectStaffDistributeValue) => boolean
}

const breakpoints = useBreakpoints(breakpointsTailwind)

const {
  isPersonalDistribute = false,
  fetchQuerykey = 'fetchAssign',
  isDistribute = true,
  availableRoles,
  formInputList,
  isGettingFlow,
  isGettingSystemConfigInfo,
  treeClass,
  preSelectValue = new Map<string, TFormSelectDistributeItemValue>(),
  isLoadingData = false,
  checkIfStaffDisabled = () => false,
  checkIfUnitDisabled = () => false
} = defineProps<TProps>()

const selectedDistributedItemsModel = defineModel<Map<string, TFormSelectDistributeItemValue>>({
  required: true
})

const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal?.trim()
}, 300)
const user = useUserProfileStore().user

const autoDisableUnitsAfterSetDefaulValue = ref<Map<string, TTreeUnitWithStaffNode>>(new Map())

const initialTree = ref<TTreeUnitWithStaffNode[]>([])
const successFetchedUnits = ref<Set<string>>(new Set())

const initialUnitIDList = computed(
  () => new Set(extractUnitFromForest(initialTree?.value ?? [])?.map((node) => node?.id))
)

const {
  data: allUnitTrees,
  isLoading: isGettingUnitsData,
  isSuccess
} = useGetTreeAssignInternalUnit(
  () => user?.currentPosition?.unitId!,
  { enabled: () => !!user?.currentPosition?.unitId },
  fetchQuerykey
)

const filteredListInternalUnitForest = computed(() => {
  const filterForest: TTreeUnitWithStaffNode[] = []
  if (allUnitTrees.value && allUnitTrees.value?.length) {
    for (const unitTree of allUnitTrees?.value) {
      const filterTreeNode = filterTreeNodeByName(unitTree, true, debouncedSearchValue.value)
      if (filterTreeNode) filterForest.push(filterTreeNode)
    }
  }
  return filterForest
})

const { mutate: fetchUnitData, isPending: isGettingUnitData } =
  useActionGetDirectChildrenAndStaffsInUnit()
const queryClient = useQueryClient()

watch(
  [allUnitTrees, isSuccess],
  ([allUnitTrees, isSuccess]) => {
    if (isSuccess) initialTree.value = [...(allUnitTrees ?? [])]
  },
  { once: true }
)
watchEffect(() => {
  console.log(allUnitTrees?.value, 'sfadfsdafdasfdasfdsa')
})
watch(
  () => isPersonalDistribute,
  () => {
    selectedDistributedItemsModel.value = new Map()
    successFetchedUnits.value = new Set()
    queryClient.setQueryData(
      ['getTreeAssignInternalUnit', user?.currentPosition?.unitId, fetchQuerykey],
      () => {
        return cloneDeep(initialTree.value)
      }
    )
  }
)
watchEffect(() => {
  console.log(initialTree.value, 'initialTree.value')
})
const handleClearEnabledSameRadioInputNameWhenItemSelected = (
  isSelectedItemBeStaff: boolean,
  selectedItemKey: string,
  formInput: TFormSelectDistribute
) => {
  if (!allUnitTrees.value || !allUnitTrees?.value?.length) return
  for (const unitTree of allUnitTrees.value) {
    if (selectedDistributedItemsModel?.value?.size && formInput.type === 'radio') {
      for (const [key, distributedItem] of selectedDistributedItemsModel?.value?.entries()) {
        const isStaff = distributedItem?.type === RECEIVER_TYPES.STAFF
        if (
          distributedItem.formName === formInput.name &&
          (key !== selectedItemKey || isSelectedItemBeStaff !== isStaff)
        ) {
          const checkedRadioValue = isStaff
            ? getStaffByPositionId(key, unitTree)
            : getUnitById(key, unitTree)
          if (
            checkedRadioValue &&
            (isStaff
              ? !checkIfStaffDisabled(
                  formatDistributeValueInputForStaff(checkedRadioValue as TTreeStaffNodeNew)
                )
              : !checkIfUnitDisabled(
                  formatDistributeValueInputForUnit(checkedRadioValue as TTreeUnitWithStaffNode)
                ) && !autoDisableUnitsAfterSetDefaulValue.value?.has(key))
          ) {
            selectedDistributedItemsModel.value.delete(key)
          }
        }
      }
    }
  }
}

const handleStaffSelect = async (staff: TTreeStaffNodeNew, formInput: TFormSelectDistribute) => {
  if (!allUnitTrees.value) return
  handleClearEnabledSameRadioInputNameWhenItemSelected(true, staff.positionId, formInput)
}

const handleStaffUnSelect = (staff: TTreeStaffNodeNew, formInput: TFormSelectDistribute) => {
  if (!allUnitTrees.value || formInput.type === 'radio') return
}

const handleFetchDirectChildenAndStaffInUnit = (unit: TTreeUnitWithStaffNode) => {
  if (
    unit?.isGroup ||
    !isPersonalDistribute ||
    successFetchedUnits?.value.has(`${unit?.id}_${unit.rootNodeId}`) ||
    (unit?.relativeLevel === 0 && (unit?.staffs?.length || unit?.subUnits?.length))
  ) {
    return
  } else {
    fetchUnitData(
      { unitId: unit?.id, relativeLevel: unit?.relativeLevel, unitLevel: unit?.levelFromRoot },
      {
        onSuccess: (newTreeNode) => {
          successFetchedUnits.value?.add(`${unit?.id}_${unit.rootNodeId}`)
          if (allUnitTrees?.value) {
            queryClient.setQueryData(
              ['getTreeAssignInternalUnit', user?.currentPosition?.unitId, fetchQuerykey],
              (oldData: TTreeUnitWithStaffNode[] | undefined) => {
                if (!oldData) return oldData
                const updatedForest = oldData?.map((tree) => {
                  if (
                    (tree?.id === unit?.rootNodeId || tree?.id === unit?.id) &&
                    newTreeNode?.length
                  ) {
                    const updateTree = replaceTreeNode(tree, unit?.id, newTreeNode?.[0]!)
                    return updateTree
                  }
                  return tree
                })
                return updatedForest
              }
            )
          }
        }
      }
    )
  }
}

const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {
  handleFetchDirectChildenAndStaffInUnit(unit)
}
const handleUnitSelect = async (unit: TTreeUnitWithStaffNode, formInput: TFormSelectDistribute) => {
  handleClearEnabledSameRadioInputNameWhenItemSelected(false, unit.id, formInput)
  if (!unit?.isGroup || !initialUnitIDList?.value?.has(unit.id)) return

  //just select all on group node that has level < 1
  //Ex:
  const allDecendantUnitsAndStaffs = getAllEnableDecendantUnitsAndStaffs(
    unit,
    initialUnitIDList?.value,
    preSelectValue,
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )

  // check all decendant staffs and units
  allDecendantUnitsAndStaffs.forEach((item) => {
    if ('positionId' in item) {
      if (checkIfStaffDisabled(formatDistributeValueInputForStaff(item))) return
      selectedDistributedItemsModel.value.set(item.positionId, {
        ...formatDistributeValueInputForStaff(item),
        formName: formInput.name
      })
      // if (item.groupIds?.length) {
      //   item.groupIds.forEach((grId) => {
      //     if (grId !== unit.id) allOtherGroupOfDecendantStaffsId.add(grId)
      //   })
      // }
    } else {
      const unitItem = transformGetDistributeUnitValue(item)
      selectedDistributedItemsModel.value.set(unitItem.id, {
        id: unitItem?.id,
        name: unitItem?.name,
        isGroup: unitItem?.isGroup,
        type: RECEIVER_TYPES?.UNIT,
        formName: formInput.name
      })
    }
  })
}

const handleUnitUnSelect = (unit: TTreeUnitWithStaffNode, formInput: TFormSelectDistribute) => {
  if (!allUnitTrees.value || formInput.type === 'radio') return
  const allDecendantUnitsAndStaffs = getAllEnableDecendantUnitsAndStaffs(
    unit,
    initialUnitIDList?.value,
    preSelectValue,
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )
  // const allOtherGroupOfDecendantStaffsId = new Set<string>()
  // uncheck all decendant staffs and units
  allDecendantUnitsAndStaffs.forEach(async (item) => {
    if ('positionId' in item) {
      if (checkIfStaffDisabled(formatDistributeValueInputForStaff(item))) return
      selectedDistributedItemsModel.value.delete(item.positionId)
    } else {
      selectedDistributedItemsModel.value.delete(item.id)
    }
    await nextTick()
  })
}

const checkIfUnsendNodeTicked = (unit: TTreeUnitWithStaffNode, formInput: TDocumentProcessRole) => {
  const allChildsDes = getAllEnableDecendantUnitsAndStaffs(
    unit,
    initialUnitIDList?.value,
    preSelectValue,
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )

  const arrChildDes = Array.from(allChildsDes?.values())
  if (!arrChildDes?.length) return false
  const listSelectedFormInputFromSelectedItems = new Set<TDocumentProcessRole | undefined>()
  arrChildDes?.forEach((destination) =>
    listSelectedFormInputFromSelectedItems.add(
      selectedDistributedItemsModel?.value?.get(
        'positionId' in destination ? destination?.positionId : destination?.id
      )?.formName
    )
  )
  if (
    listSelectedFormInputFromSelectedItems?.size === 1 &&
    listSelectedFormInputFromSelectedItems.has(formInput)
  )
    return true
  return false
}

const allEnableRootUnits = computed(() =>
  filteredListInternalUnitForest?.value?.filter(
    (root) =>
      !checkIfUnitDisabled(formatDistributeValueInputForUnit(root)) &&
      !preSelectValue?.has(root?.id)
  )
)
const checkIfTickedAll = (formInput: TDocumentProcessRole) => {
  if (!allEnableRootUnits?.value?.length || !selectedDistributedItemsModel?.value?.size) return null

  return allEnableRootUnits?.value?.every((availableRoot) => {
    if (availableRoot?.isGroup) return checkIfUnsendNodeTicked(availableRoot, formInput)
    else {
      const selectedUnit = selectedDistributedItemsModel?.value?.get(availableRoot?.id)
      return selectedUnit && selectedUnit?.formName === formInput
    }
  })
}
const handleToggleSelectAll = (val: Event, formInput: TFormSelectDistribute) => {
  const target = val?.target as HTMLInputElement
  if (target.checked) {
    allEnableRootUnits?.value?.forEach((root) => {
      const rootValue = transformGetDistributeUnitValue(root)
      if (!root?.isGroup)
        selectedDistributedItemsModel?.value.set(root?.id, {
          id: rootValue?.id,
          name: rootValue?.name,
          isGroup: rootValue?.isGroup,
          type: RECEIVER_TYPES?.UNIT,
          formName: formInput?.name
        })
      handleUnitSelect(root, formInput)
    })
  } else {
    allEnableRootUnits?.value?.forEach((root) => {
      selectedDistributedItemsModel?.value?.delete(root?.id)
      handleUnitUnSelect(root, formInput)
    })
  }
}

const handleToggleUnsendUnit = (
  unit: TTreeUnitWithStaffNode,
  isChecked: boolean,
  formInput: TFormSelectDistribute
) => {
  if (isChecked) {
    handleUnitSelect(unit, formInput)
  } else {
    const allDecendantUnitsAndStaffs = getAllEnableDecendantUnitsAndStaffs(
      unit,
      initialUnitIDList?.value,
      preSelectValue,
      checkIfUnitDisabled,
      checkIfStaffDisabled
    )
    allDecendantUnitsAndStaffs.forEach((item) => {
      if ('positionId' in item) {
        if (checkIfStaffDisabled(formatDistributeValueInputForStaff(item))) return
        selectedDistributedItemsModel?.value?.delete(item.positionId)
      } else {
        const unitItem = formatDistributeValueInputForUnit(item)
        selectedDistributedItemsModel?.value?.delete(unitItem.id)
      }
    })
  }
}

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>
<template>
  <div class="flex h-full flex-col overflow-auto">
    <div class="flex items-center justify-center">
      <div
        class="custom-input border-surface-300 mb-2 inline-flex h-10 w-full items-center rounded-md border bg-white px-2 py-1"
      >
        <span
          class="custom-input--icon__search shrink-0 pl-2 text-2xl text-gray-500"
          :class="'icon-[line-md--search]'"
        />
        <input
          ref="searchInputRef"
          class="w-full border-none px-2 py-1 outline-none"
          placeholder="Tìm kiếm"
          v-model="searchValue"
        />
        <span
          v-if="searchValue"
          class="mr-1 text-xl text-gray-400 hover:cursor-pointer active:text-gray-500"
          :class="'icon-[line-md--close-circle-filled]'"
          @click="searchValue = ''"
        />
      </div>
    </div>
    <div class="h-full flex-1 overflow-y-auto shadow-md">
      <div
        class="bg-primary top-0 flex h-10 items-center gap-1 px-2 py-2 font-bold text-white lg:px-4"
      >
        <div class="item flex-1">Đơn vị</div>
        <div
          v-for="(processRole, idx) in availableRoles"
          :key="idx"
          v-tippy="processRole?.fullLabel"
          class="flex w-10 shrink-0 items-center justify-center lg:w-24"
        >
          {{ breakpoints.greater('lg').value ? processRole?.fullLabel : processRole?.shortLabel }}
        </div>
      </div>
      <div class="'relative overflow-y-auto' h-[calc(100%-2.5rem)] flex-1" :class="treeClass">
        <div
          v-if="
            isGettingUnitsData ||
            isGettingUnitData ||
            isGettingFlow ||
            isGettingSystemConfigInfo ||
            isLoadingData
          "
          class="absolute flex h-full w-full items-center justify-center"
        >
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
        <!-- <template> -->
        <template v-if="allUnitTrees">
          <div
            :class="[
              `border-shadow text-primary mb-1/4 flex h-12 items-center gap-1 bg-white px-2 py-2 font-bold lg:px-4`,
              $attrs.class
            ]"
          >
            <div class="flex flex-1 items-center truncate">
              <div class="truncate" v-tippy="'Toàn bộ đơn vị'">Toàn bộ đơn vị</div>
            </div>
            <div
              v-for="(formInput, idx) in formInputList"
              :key="idx"
              class="flex w-10 shrink-0 items-center justify-center lg:w-24"
            >
              <Checkbox
                v-if="formInput.type === 'checkbox'"
                :model-value="checkIfTickedAll(formInput?.name)"
                readonly
                :true-value="true"
                :false-value="false"
                @click.stop
                binary
                :disabled="!allEnableRootUnits?.length"
                @click="(event: any) => handleToggleSelectAll(event, formInput)"
              ></Checkbox>
              <RadioButton v-else :name="formInput.name" binary disabled></RadioButton>
            </div>
          </div>
          <template v-for="(subUnit, index) in filteredListInternalUnitForest" :key="index">
            <GroupDistributeNode
              v-if="subUnit?.isGroup"
              :isPersonalDistribute
              :form-input-list="formInputList"
              :unit="subUnit"
              v-model="selectedDistributedItemsModel"
              :isDistribute
              :checkIfUnitDisabled="checkIfUnitDisabled"
              :checkIfStaffDisabled="checkIfStaffDisabled"
              :readOnlySelectedItems="preSelectValue"
              :initialUnitIDList
              @unit-click="handleUnitClick"
              @unit-select="handleUnitSelect"
              @unit-unselect="handleUnitUnSelect"
              @staff-select="handleStaffSelect"
              @staff-unselect="handleStaffUnSelect"
              @group-unit-click="handleToggleUnsendUnit"
              :isDefaultExpandAll="!!debouncedSearchValue"
            />
            <UnitDistributeNode
              v-else
              :isPersonalDistribute
              :form-input-list="formInputList"
              :unit="subUnit"
              v-model="selectedDistributedItemsModel"
              :isDistribute
              :checkIfUnitDisabled="checkIfUnitDisabled"
              :checkIfStaffDisabled="checkIfStaffDisabled"
              :readOnlySelectedItems="preSelectValue"
              :initialUnitIDList
              @unit-click="handleUnitClick"
              @unit-select="handleUnitSelect"
              @unit-unselect="handleUnitUnSelect"
              @staff-select="handleStaffSelect"
              @staff-unselect="handleStaffUnSelect"
              @group-unit-click="handleToggleUnsendUnit"
              :isDefaultExpandAll="!!debouncedSearchValue"
            />
          </template>
        </template>
        <div v-else class="flex h-full w-full items-center justify-center">
          <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
          <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
        </div>
        <!-- </template> -->
      </div>
    </div>
  </div>
</template>
