<script setup lang="ts">
import InternalUnitDestination from '@/shared/components/outDoc/InternalUnitDestination.vue'
import UnSendInternalUnitDestination from '@/shared/components/outDoc/UnSendInternalUnitDestination.vue'
import { useGetSystemConfig } from '@/shared/composables/queries/system/useGetSystemConfig'
import { SELECT_INPUT_TYPE } from '@/shared/constants/common'
import {
  DOCUMENT_PROCESS_NUMBER,
  RECEIVER_SYSTEM_TYPES,
  type TDocumentProcessNumber,
  type TDocumentProcessRole
} from '@/shared/constants/document'
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import type {
  TFormDestinationProcessRoleInput,
  TFormSelectDestinationValue,
  TFormSelectDestinationValues,
  TInUnitDestinationSelect,
  TStaffDestinationSelect
} from '@/shared/models/outDoc/destination'
import { getDisplayDistributeLabel } from '@/shared/utils/document'
import { filterTreeNodeByName } from '@/shared/utils/organization/unit'
import {
  formatSelectValueForInternalStaff,
  formatSelectValueForInternalUnit,
  getAllEnableDecendantUnitsAndStaffs
} from '@/shared/utils/outDoc/destination'
import { breakpointsTailwind, useBreakpoints, useDebounceFn } from '@vueuse/core'
import { Checkbox, RadioButton } from 'primevue'
import { computed, nextTick, ref, watch } from 'vue'
import { useGetDestination } from '../composables/queries/useGetDestination'
type TProps = {
  unitId: string
  readOnlySelectedDestinations?: TFormSelectDestinationValues
  checkIfUnitDisabled?: (unit: TInUnitDestinationSelect) => boolean
  checkIfStaffDisabled?: (staff: TStaffDestinationSelect) => boolean
}

const {
  checkIfStaffDisabled = () => false,
  checkIfUnitDisabled = () => false,
  readOnlySelectedDestinations = new Map<string, TFormSelectDestinationValue>(),
  unitId
} = defineProps<TProps>()

const selectedDestinations = defineModel<TFormSelectDestinationValues>({
  required: true
})

const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal?.trim()
}, 300)

const { data: allUnitTrees, isLoading: isGettingUnitsData } = useGetDestination(() => unitId)
const { data: systemConfig, isLoading: isGettingSystemConfigInfo } = useGetSystemConfig()

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

const breakpoints = useBreakpoints(breakpointsTailwind)

const inputList = computed(() => {
  if (!systemConfig?.value?.systemRoleConfig) return []
  return (
    Object.entries(systemConfig?.value?.systemRoleConfig) as [
      TDocumentProcessRole,
      TDocumentProcessNumber | 'NONE'
    ][]
  )
    ?.filter(([_, type]) => type !== 'NONE')
    ?.map(([role, type]) => ({
      labels: getDisplayDistributeLabel(role),
      value: role,
      type:
        type === DOCUMENT_PROCESS_NUMBER.one ? SELECT_INPUT_TYPE.radio : SELECT_INPUT_TYPE.checkbox
    }))
})

const selectedCheckedReadOnlyInputs = computed(() => {
  const selectedInputValues = new Set<TDocumentProcessRole>()
  // selectedDestinations?.value?.forEach((selectedDestination) =>
  //   selectedInputValues.add(selectedDestination?.formName)
  // )
  readOnlySelectedDestinations?.forEach((readOnlyselectedDestination) =>
    selectedInputValues.add(readOnlyselectedDestination?.formName)
  )
  return selectedInputValues
})

const allEnableRootUnits = computed(() =>
  filteredListInternalUnitForest?.value?.filter(
    (root) =>
      !checkIfUnitDisabled(formatSelectValueForInternalUnit(root)) &&
      !readOnlySelectedDestinations?.has(root?.id)
  )
)

// const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {}

const handleUnitSelect = async (
  unit: TTreeUnitWithStaffNode,
  formInput: TFormDestinationProcessRoleInput
) => {
  if (formInput?.type === SELECT_INPUT_TYPE?.radio && selectedDestinations?.value?.size) {
    for (const [id, destination] of selectedDestinations?.value?.entries()) {
      if (destination?.formName === formInput?.name && unit?.id !== id) {
        selectedDestinations?.value?.delete(id)
        break
      }
    }
  } else {
    const allDecendantUnitsAndStaffs = getAllEnableDecendantUnitsAndStaffs(
      unit,
      readOnlySelectedDestinations,
      checkIfUnitDisabled,
      checkIfStaffDisabled
    )
    allDecendantUnitsAndStaffs.forEach((item) => {
      if ('positionId' in item) {
        if (checkIfStaffDisabled(formatSelectValueForInternalStaff(item))) return
        selectedDestinations?.value.set(item.positionId, {
          ...formatSelectValueForInternalStaff(item),
          formName: formInput.name
        })
      } else {
        const unitItem = formatSelectValueForInternalUnit(item)
        selectedDestinations?.value.set(unitItem.id, {
          ...unitItem,
          formName: formInput.name
        })
      }
    })
  }
}

// const handleUnitUnSelect = (
//   unit: TTreeUnitWithStaffNode,
//   formInput: TFormDestinationProcessRoleInput
// ) => {}

const handleStaffSelect = async (
  staff: TTreeStaffNodeNew,
  formInput: TFormDestinationProcessRoleInput
) => {
  if (formInput?.type === SELECT_INPUT_TYPE?.radio && selectedDestinations?.value?.size) {
    for (const [id, destination] of selectedDestinations?.value?.entries()) {
      if (destination?.formName === formInput?.name && id !== staff?.positionId) {
        selectedDestinations?.value?.delete(id)
        break
      }
    }
  }
}

// const handleStaffUnSelect = (
//   staff: TTreeStaffNodeNew,
//   formInput: TFormDestinationProcessRoleInput
// ) => {}

const handleToggleUnsendUnit = (
  unit: TTreeUnitWithStaffNode,
  isChecked: boolean,
  formInput: TFormDestinationProcessRoleInput
) => {
  if (isChecked) {
    handleUnitSelect(unit, formInput)
  } else {
    const allDecendantUnitsAndStaffs = getAllEnableDecendantUnitsAndStaffs(
      unit,
      readOnlySelectedDestinations,
      checkIfUnitDisabled,
      checkIfStaffDisabled
    )
    allDecendantUnitsAndStaffs.forEach((item) => {
      if ('positionId' in item) {
        if (checkIfStaffDisabled(formatSelectValueForInternalStaff(item))) return
        selectedDestinations?.value?.delete(item.positionId)
      } else {
        const unitItem = formatSelectValueForInternalUnit(item)
        selectedDestinations?.value?.delete(unitItem.id)
      }
    })
  }
}

const handleToggleSelectAll = async (val: Event, formInput: TFormDestinationProcessRoleInput) => {
  const target = val?.target as HTMLInputElement
  if (target.checked) {
    allEnableRootUnits?.value?.forEach((root) => {
      handleUnitSelect(root, formInput)
      if (!root?.isGroup && !root?.containStaff) {
        selectedDestinations?.value.set(root.id, {
          ...formatSelectValueForInternalUnit(root),
          formName: formInput?.name
        })
      }
    })
  } else {
    selectedDestinations.value = new Map(
      [...selectedDestinations.value].filter(
        ([, destination]) => destination?.systemType === RECEIVER_SYSTEM_TYPES.external
      )
    )
  }
  await nextTick()
}

const checkIfUnsendNodeTicked = (unit: TTreeUnitWithStaffNode, formInput: TDocumentProcessRole) => {
  const allChildsDes = getAllEnableDecendantUnitsAndStaffs(
    unit,
    readOnlySelectedDestinations ?? new Map(),
    checkIfUnitDisabled,
    checkIfStaffDisabled
  )

  const arrChildDes = Array.from(allChildsDes?.values())
  if (!arrChildDes?.length) return false
  const listSelectedFormInputFromSelectedDestinations = new Set<TDocumentProcessRole | undefined>()
  arrChildDes?.forEach((destination) =>
    listSelectedFormInputFromSelectedDestinations.add(
      selectedDestinations?.value?.get(
        'positionId' in destination ? destination?.positionId : destination?.id
      )?.formName
    )
  )
  if (
    listSelectedFormInputFromSelectedDestinations?.size === 1 &&
    listSelectedFormInputFromSelectedDestinations.has(formInput)
  )
    return true
  return false
}

const checkIfTickedAll = (formInput: TDocumentProcessRole) => {
  if (!allEnableRootUnits?.value?.length || !selectedDestinations?.value?.size) return null

  return allEnableRootUnits?.value?.every((availableRoot) => {
    if (availableRoot?.isGroup || availableRoot?.containStaff)
      return checkIfUnsendNodeTicked(availableRoot, formInput)
    else {
      const selectedUnit = selectedDestinations?.value?.get(availableRoot?.id)
      return selectedUnit && selectedUnit?.formName === formInput
    }
  })
}

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>
<template>
  <div>
    <div class="mt-4 flex items-center justify-center">
      <div
        class="custom-input border-surface-300 inline-flex h-10 w-full items-center rounded-md border bg-white px-2 py-1"
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
    <div class="border-shadow mt-4">
      <div class="bg-primary flex h-10 items-center gap-1 px-4 py-2 font-bold text-white">
        <div class="item flex-1">Đơn vị</div>
        <div
          v-for="(input, idx) in inputList"
          :key="idx"
          v-tippy="input.labels.fullLabel"
          class="flex w-10 shrink-0 items-center justify-center lg:w-24"
        >
          {{ breakpoints.greater('lg').value ? input.labels.fullLabel : input.labels.shortLabel }}
        </div>
      </div>
      <div class="relative">
        <div
          v-if="isGettingUnitsData || isGettingSystemConfigInfo"
          class="absolute top-0 left-0 flex h-full w-full items-center justify-center"
        >
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
        <div
          v-if="!filteredListInternalUnitForest?.length"
          class="flex h-full min-h-[200px] w-full items-center justify-center bg-white"
        >
          <span class="icon-[mdi--flask-empty-remove-outline] text-4xl text-gray-400"></span>
          <span class="text-lg font-medium text-gray-400">Không có đơn vị</span>
        </div>
        <div v-else class="relative h-[400px] min-h-[200px] overflow-auto">
          <div
            :class="[
              `text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-2 py-2 font-bold lg:px-4`,
              $attrs.class
            ]"
          >
            <div class="flex flex-1 items-center truncate">
              <div class="truncate" v-tippy="'Toàn bộ đơn vị'">Toàn bộ đơn vị</div>
            </div>
            <div
              v-for="(formInput, idx) in inputList"
              :key="idx"
              class="flex w-10 shrink-0 items-center justify-center lg:w-24"
            >
              <Checkbox
                v-if="formInput.type === SELECT_INPUT_TYPE.checkbox"
                :model-value="checkIfTickedAll(formInput.value)"
                readonly
                :true-value="true"
                :false-value="false"
                @click.stop
                binary
                :disabled="!allEnableRootUnits?.length"
                @click="
                  (event: any) =>
                    handleToggleSelectAll(event, { type: formInput?.type, name: formInput?.value })
                "
              ></Checkbox>
              <RadioButton v-else :name="formInput.value" binary disabled></RadioButton>
            </div>
          </div>
          <template v-for="(unitTree, index) in filteredListInternalUnitForest" :key="index">
            <UnSendInternalUnitDestination
              v-if="unitTree?.isGroup || unitTree?.containStaff"
              v-model="selectedDestinations"
              :formInputList="
                inputList?.map((input) => ({
                  name: input?.value,
                  type: input?.type
                }))
              "
              :unit="unitTree"
              :readOnlySelectedDestinations
              :checkIfUnitDisabled="checkIfUnitDisabled"
              :checkIfStaffDisabled="checkIfStaffDisabled"
              @unit-select="handleUnitSelect"
              @staff-select="handleStaffSelect"
              @unsend-unit-click="handleToggleUnsendUnit"
              :selectedCheckedReadOnlyInputs
              :isDefaultExpandAll="!!debouncedSearchValue"
            />
            <InternalUnitDestination
              v-else
              v-model="selectedDestinations"
              :formInputList="
                inputList?.map((input) => ({
                  name: input?.value,
                  type: input?.type
                }))
              "
              :unit="unitTree"
              :readOnlySelectedDestinations
              :checkIfUnitDisabled="checkIfUnitDisabled"
              :checkIfStaffDisabled="checkIfStaffDisabled"
              @unit-select="handleUnitSelect"
              @staff-select="handleStaffSelect"
              @unsend-unit-click="handleToggleUnsendUnit"
              :selectedCheckedReadOnlyInputs
              :isDefaultExpandAll="!!debouncedSearchValue"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
