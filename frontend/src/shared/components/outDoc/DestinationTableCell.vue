<script setup lang="ts">
import type { ListDocumentVM } from '@/shared/services/api'
import { computed, ref } from 'vue'
import {
  DESTINATION_STATUS_DISPLAY,
  DESTINATION_STATUS_VALUES
} from '../../constants/outDoc/destination'

type TProps = {
  document: ListDocumentVM
  maxDisplaySize?: number
}

const { document, maxDisplaySize = 2 } = defineProps<TProps>()

const isExpand = ref(false)

const listDisplayDestination = computed(() => {
  if (document?.destinations?.length > maxDisplaySize) {
    if (isExpand.value) {
      return document?.destinations
    } else {
      return document?.destinations?.slice(0, maxDisplaySize)
    }
  }
  return document?.destinations
})
const handleToggleShowMore = () => {
  isExpand.value = !isExpand.value
}
</script>
<template>
  <div v-if="!document?.destinations?.length">--</div>
  <div v-for="(destination, idx) in listDisplayDestination" :key="idx">
    <span class="wrap-break-word">{{ destination?.name }}</span>
    <span
      v-if="destination?.destinationStatus !== DESTINATION_STATUS_VALUES.unsent"
      :style="{ color: DESTINATION_STATUS_DISPLAY?.[destination?.destinationStatus]?.color }"
    >
      ({{ DESTINATION_STATUS_DISPLAY?.[destination?.destinationStatus]?.label }})
    </span>
  </div>
  <span
    v-if="document?.destinations?.length > maxDisplaySize"
    class="text-primary font-semibold underline"
    @click.stop="handleToggleShowMore"
    >{{ isExpand ? 'Ẩn bớt' : 'Xem thêm' }}</span
  >
</template>
