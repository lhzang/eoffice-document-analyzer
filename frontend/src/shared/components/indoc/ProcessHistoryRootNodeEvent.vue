<script setup lang="ts">
import type { TProcessHistoryGroupEvent } from '@/shared/models/indoc'
import { ref } from 'vue'
import ProcessHistoryRootNodeDetailEvent from './ProcessHistoryRootNodeDetailEvent.vue'

type TProps = {
  event: TProcessHistoryGroupEvent
  preFetch: boolean
  level: number
}
const { preFetch, event, level } = defineProps<TProps>()
const isExpanded = ref(preFetch || !event?.displayName)

const handleClickExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>
<template>
  <div>
    <div
      v-if="event?.displayName"
      @click="handleClickExpand"
      class="flex cursor-pointer items-center gap-2"
      :style="{ marginLeft: level * 20 + 'px' }"
    >
      <span class="icon-[mdi--tick-circle] text-primary shrink-0"></span>
      <span class="truncate font-semibold">{{ event?.displayName }}</span>
      <span
        v-if="isExpanded"
        class="icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0 text-lg text-inherit"
      ></span>
      <span
        v-else
        class="icon-[ic--round-keyboard-arrow-right] focus:text-primary shrink-0 text-lg text-inherit"
      ></span>
    </div>
    <div v-if="isExpanded">
      <ProcessHistoryRootNodeDetailEvent
        v-for="(eventItem, idx) in event?.eventItems"
        :key="idx"
        :level="level + 1"
        :event-item="eventItem"
        :isIndent="!!event?.displayName"
      />
    </div>
  </div>
</template>
