<script setup lang="ts">
import { type CSSProperties } from 'vue'

import { URGENCY_LEVELS } from '@/shared/constants/document'

type TPriorityValue = (typeof URGENCY_LEVELS)[number]['value']

const {
  priority,
  excludePriorities = ['NORMAL'],
  wrapperStyles = {}
} = defineProps<{
  priority: TPriorityValue
  excludePriorities: TPriorityValue[]
  wrapperStyles?: CSSProperties
}>()

const priorityLevel = URGENCY_LEVELS.find((level) => level.value === priority)
</script>
<template>
  <div>
    <div
      v-if="priorityLevel && !excludePriorities.includes(priorityLevel.value)"
      class="w-max rounded-[4px] px-2 py-[2px] text-[12px] font-bold text-[#FCFCFD] capitalize"
      :style="{ backgroundColor: priorityLevel.color, ...wrapperStyles }"
    >
      {{ priorityLevel.title }}
    </div>
  </div>
</template>

<style scoped></style>
