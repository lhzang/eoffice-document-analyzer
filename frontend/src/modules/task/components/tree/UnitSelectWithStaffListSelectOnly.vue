<script setup lang="ts">
import type {
  TStaffSelectValue,
  TTreeStaffNodeNew,
  TTreeUnitWithStaffNode
} from '@/shared/models/organization/unit'
import { Checkbox } from 'primevue'
import { computed, markRaw, ref, toRaw, watch } from 'vue'
import StaffListOnlySelect from './StaffListOnlySelect.vue'
//type
type TProps = {
  formName: string
  unit: TTreeUnitWithStaffNode
  disabled?: boolean
  level?: number
  isDefaultExpandAll?: boolean
  checkIfStaffDisabled?: (staff: TTreeStaffNodeNew) => boolean
  checkIfUnitDisabled?: (unit: TTreeUnitWithStaffNode) => boolean
}

//props
const {
  formName,
  unit,
  disabled = false,
  level = 0,
  isDefaultExpandAll = false,
  checkIfStaffDisabled = () => false,
  checkIfUnitDisabled = () => false
} = defineProps<TProps>()

const emits = defineEmits<{
  'unit-click': [TTreeUnitWithStaffNode]
}>()

const isExpaned = ref<boolean>(unit?.relativeLevel === 0 || isDefaultExpandAll)

const modelValue = defineModel<TStaffSelectValue[] | null>({
  required: true
})

const selectableStaffs = computed(() => unit?.staffs ?? [])
// Only get staffs that are not disabled
const enabledStaffs = computed(() =>
  selectableStaffs.value.filter((staff) => !checkIfStaffDisabled(staff))
)
const isCheckboxDisabled = computed(() => checkIfUnitDisabled(unit))

// Flag for waiting until lazy-loaded staff finishes before toggling.
const pendingUnitSelectAll = ref<boolean>(false)

const selectedValues = computed<TStaffSelectValue[]>(() => {
  return modelValue.value ?? []
})

// Staff IDs are already selected
const selectedStaffIds = computed<Set<string>>(() => {
  const ids = new Set<string>()
  selectedValues.value.forEach((value) => {
    ids.add(value.positionId)
  })
  return ids
})

// Check if all selectable (enabled) staffs are selected
const isAllSelectableStaffSelected = computed<boolean>(() => {
  if (!enabledStaffs.value.length) return false
  return enabledStaffs.value.every((staffItem) => selectedStaffIds.value.has(staffItem.positionId))
})

// Checkbox model
const unitModelValue = computed<boolean>(() => {
  return isAllSelectableStaffSelected.value
})

const openSub = () => {
  isExpaned.value = !isExpaned.value
  emits('unit-click', unit)
}

watch(
  () => isDefaultExpandAll,
  (isExpand) => {
    isExpaned.value = isExpand || unit?.relativeLevel === 0
  }
)

// Select all enabled staff under this unit
const selectAllForUnit = () => {
  isExpaned.value = true
  const currentSelections = Array.isArray(modelValue.value)
    ? (modelValue.value as TStaffSelectValue[])
    : []

  const normalizedSelections = currentSelections.map((value) =>
    markRaw(toRaw(value))
  ) as TStaffSelectValue[]

  const selectedStaffIds = new Set(normalizedSelections.map((value) => value.positionId))

  // Only select enabled staffs
  enabledStaffs.value.forEach((staffItem) => {
    if (!selectedStaffIds.has(staffItem.positionId)) {
      normalizedSelections.push(markRaw(toRaw(staffItem)) as TStaffSelectValue)
    }
  })

  modelValue.value = normalizedSelections
}

// Checkbox handler for units - similar to AssignIDTree.vue
const handleUnitCheckboxToggle = (val: Event) => {
  const target = val?.target as HTMLInputElement

  if (target.checked) {
    isExpaned.value = true
    pendingUnitSelectAll.value = true
    emits('unit-click', unit)

    selectAllForUnit()

    if (enabledStaffs.value.length) {
      pendingUnitSelectAll.value = false
    }
  } else {
    pendingUnitSelectAll.value = false
    // Only unselect enabled staffs
    const enabledStaffIdsBelongToUnit = new Set(
      enabledStaffs.value.map((staffItem) => staffItem.positionId)
    )

    const nextSelections: TStaffSelectValue[] = []
    selectedValues.value.forEach((value) => {
      // Only remove enabled staffs, keep disabled staffs if they were selected
      if (enabledStaffIdsBelongToUnit.has(value.positionId)) {
        return
      }
      nextSelections.push(value)
    })

    modelValue.value = nextSelections
  }
}

// when staff are fetched after unit click, select all of them
watch(
  () => selectableStaffs.value.map((staff) => staff.positionId),
  (newStaffIds, oldStaffIds) => {
    if (!pendingUnitSelectAll.value) return
    const hadNoStaffBefore = !oldStaffIds || oldStaffIds.length === 0
    const hasStaffNow = newStaffIds.length > 0
    if (hadNoStaffBefore && hasStaffNow) {
      selectAllForUnit()
      pendingUnitSelectAll.value = false
    }
  }
)

// if unit has no staff, stop waiting to prevent infinite pending state
watch(
  () => unit?.staffs,
  (newStaffs, oldStaffs) => {
    if (!pendingUnitSelectAll.value) return
    if (newStaffs === oldStaffs) return
    if (!selectableStaffs.value.length) {
      pendingUnitSelectAll.value = false
    }
  }
)
</script>
<template>
  <div
    :class="`text-primary border-shadow mb-1/4 flex h-12 items-center gap-1 bg-white px-4 py-2 font-bold ${
      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    }`"
    @click="openSub"
  >
    <div class="flex flex-1 items-center truncate" :style="{ marginLeft: `${level * 18}px` }">
      <template v-if="unit?.subUnits?.length || unit?.staffs?.length">
        <span
          v-if="isExpaned"
          class="icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
        <span
          v-else
          class="icon-[ic--round-keyboard-arrow-right] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
      </template>
      <span :class="{ 'ml-3': !(unit?.subUnits?.length && unit?.staffs?.length) }">{{
        unit?.name
      }}</span>
    </div>
    <div class="flex h-auto w-10 shrink-0 items-center justify-center">
      <template v-if="!unit?.isGroup">
        <Checkbox
          readonly
          :name="formName"
          :model-value="unitModelValue"
          :true-value="true"
          :false-value="false"
          binary
          :disabled="isCheckboxDisabled"
          @click.stop
          @click="(event: any) => handleUnitCheckboxToggle(event)"
        ></Checkbox>
      </template>
    </div>
  </div>
  <template v-if="isExpaned">
    <StaffListOnlySelect
      :form-name
      :disabled
      :level="level + 1"
      v-for="(staff, index) in unit?.staffs"
      :key="index"
      :staff="staff"
      v-model="modelValue"
      :checkIfStaffDisabled
    />
    <UnitSelectWithStaffListSelectOnly
      :form-name
      :disabled
      :level="level + 1"
      v-for="(subUnit, index) in unit?.subUnits"
      :key="index"
      :unit="subUnit"
      v-model="modelValue"
      :isDefaultExpandAll
      :checkIfStaffDisabled
      :checkIfUnitDisabled
      @unit-click="(unit) => emits('unit-click', unit)"
    />
  </template>
</template>
