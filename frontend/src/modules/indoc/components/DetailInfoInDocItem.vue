<script setup lang="ts">
import { Skeleton } from 'primevue'
import { isVNode, type VNode } from 'vue'

import type { TPriorityLevel } from '../models/types'
import PriorityLevelComponent from './PriorityLevelComponent.vue'

type TDetailInDocItem = {
  info: {
    name: string
    info?: string | VNode
    urgency?: TPriorityLevel
    position?: string
  }
  isLoading: boolean
}

const { info } = defineProps<TDetailInDocItem>()
</script>
<template>
  <div
    class="flex w-full items-center justify-between gap-2 border-b-[1px] border-b-[#e6e8ec] py-2"
  >
    <Skeleton v-if="isLoading" animation="wave" class="w-full" />
    <template v-else>
      <div class="flex-1/4">{{ info.name }}</div>
      <div class="flex-3/4 justify-items-end">
        <div
          v-if="typeof info.info === 'string'"
          class="ml-[5px] justify-end overflow-hidden text-right"
        >
          {{ info.info }}
        </div>
        <component :is="info.info" v-else-if="isVNode(info.info)" />

        <PriorityLevelComponent
          v-if="info.urgency?.value"
          :priority="info.urgency.value"
          :excludePriorities="[]"
          :wrapperStyles="{
            marginLeft: '0px',
            padding: '2px 4px'
          }"
        />
        <div v-if="info.urgency?.value" class="custom-priority"></div>
        <div v-if="info.position" class="custom-position">{{ info.position }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
