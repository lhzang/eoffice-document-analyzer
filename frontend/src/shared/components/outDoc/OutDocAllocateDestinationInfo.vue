<script setup lang="ts">
import { RECEIVER_SYSTEM_TYPES } from '@/shared/constants/document'
import type { TFormSelectDestinationValue } from '@/shared/models/outDoc/destination'
import { computed, ref } from 'vue'

type TProps = {
  type: 'internal' | 'external'
  destinationList?: TFormSelectDestinationValue[]
  maxDisplaySize?: number
}

const { destinationList = [], type, maxDisplaySize = 5 } = defineProps<TProps>()

const isExpand = ref(false)

const handleToggleShowMore = () => {
  isExpand.value = !isExpand.value
}

const filterDestinationByType = computed(() => {
  if (type === 'internal')
    return destinationList?.filter(
      (destination) => !(destination?.systemType === RECEIVER_SYSTEM_TYPES?.external)
    )
  return destinationList?.filter(
    (destination) => destination?.systemType === RECEIVER_SYSTEM_TYPES?.external
  )
})

const listDisplayDestination = computed(() => {
  if (filterDestinationByType.value?.length > maxDisplaySize) {
    if (isExpand.value) {
      return filterDestinationByType?.value
    } else {
      return filterDestinationByType?.value?.slice(0, maxDisplaySize)
    }
  }
  return filterDestinationByType?.value
})
</script>
<template>
  <div class="text-right">
    <div
      v-for="(destination, idx) in listDisplayDestination"
      class="mb-1 flex flex-col items-end font-semibold"
      :key="idx"
    >
      <div class="flex items-start gap-2">
        <!-- <DistributeRoleTag v-if="type === 'internal'" :role="destination?.role" class="shrink-0" /> -->
        <div class="overflow-auto text-right">{{ destination?.name }}</div>
      </div>
    </div>
    <span
      v-if="filterDestinationByType?.length > maxDisplaySize"
      class="text-primary items-self-end cursor-pointer font-semibold underline"
      @click.stop="handleToggleShowMore"
      >{{ isExpand ? 'Ẩn bớt' : 'Xem thêm' }}</span
    >
  </div>
</template>
