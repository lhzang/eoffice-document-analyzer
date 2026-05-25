<script setup lang="ts">
import type { TTreeStaffNodeNew, TTreeUnitWithStaffNode } from '@/shared/models/organization/unit'
import { ref } from 'vue'

interface Props {
  unit: TTreeUnitWithStaffNode
  isDefaultExpandAll?: boolean
  expandedUnits?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  isDefaultExpandAll: false
})

const emits = defineEmits<{
  'unit-click': [unit: TTreeUnitWithStaffNode]
  'staff-click': [staff: TTreeStaffNodeNew]
  expand: [unit: TTreeUnitWithStaffNode]
  collapse: [unit: TTreeUnitWithStaffNode]
}>()

const isExpanded = ref<boolean>(
  props.expandedUnits?.has(props.unit.id) ||
    props.unit.relativeLevel === 0 ||
    (props.unit.relativeLevel === 1 && props.isDefaultExpandAll)
)

const toggleExpand = () => {
  const next = !isExpanded.value

  if (next) {
    props.expandedUnits?.add(props.unit.id)
    emits('expand', props.unit)
  } else {
    props.expandedUnits?.delete(props.unit.id)
    emits('collapse', props.unit)
  }

  isExpanded.value = next
}

const handleUnitClick = (unit: TTreeUnitWithStaffNode) => {
  emits('unit-click', unit)
}

const handleStaffClick = (staff: TTreeStaffNodeNew) => {
  emits('staff-click', staff)
}
</script>

<template>
  <div
    :class="`text-primary mb-1 flex h-10 cursor-pointer items-center gap-1 bg-white px-4 py-2 font-bold`"
    @click.stop="toggleExpand"
  >
    <div
      class="flex flex-1 items-center truncate"
      :style="{ marginLeft: `${unit.relativeLevel * 18}px` }"
    >
      <span
        v-if="isExpanded"
        class="icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0 text-lg text-inherit"
      ></span>
      <span
        v-else
        class="icon-[ic--round-keyboard-arrow-right] focus:text-primary shrink-0 text-lg text-inherit"
      ></span>
      <span class="ml-[12px]" @click.stop="handleUnitClick(unit)">
        {{ unit?.name }}
      </span>
    </div>
  </div>

  <template v-if="isExpanded">
    <div v-if="unit?.staffs?.length">
      <div
        v-for="staff in unit.staffs"
        :key="staff.positionId"
        class="flex h-10 cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-50"
        :style="{ marginLeft: `${(unit.relativeLevel + 1) * 18 + 12}px` }"
        @click="handleStaffClick(staff)"
      >
        <span class="icon-[ic--round-person] text-xl text-gray-500"></span>
        <span class="text-base text-gray-700">{{ staff.displayName }}</span>
      </div>
    </div>

    <SimpleUnitTree
      v-for="subUnit in unit?.subUnits"
      :key="`${subUnit.id}-${subUnit.staffs?.length || 0}-${subUnit.subUnits?.length || 0}`"
      :unit="subUnit"
      :isDefaultExpandAll="isDefaultExpandAll"
      :expandedUnits="expandedUnits"
      @unit-click="handleUnitClick"
      @staff-click="handleStaffClick"
      @expand="$emit('expand', $event)"
      @collapse="$emit('collapse', $event)"
    />
  </template>
</template>
