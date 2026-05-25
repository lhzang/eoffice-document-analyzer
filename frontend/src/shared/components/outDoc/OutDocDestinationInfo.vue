<script setup lang="ts">
import DistributeRoleTag from '@/modules/indoc/components/DistributeRoleTag.vue'
import ModalViewDestinationProcessHistory from '@/modules/outDocument/components/ModalViewDestinationProcessHistory.vue'
import { RECEIVER_TYPES } from '@/shared/constants/document'
import {
  DESTINATION_STATUS_DISPLAY,
  DESTINATION_STATUS_VALUES
} from '@/shared/constants/outDoc/destination'
import type { DestinationVM } from '@/shared/services/api'
import { computed, ref, useTemplateRef } from 'vue'

type TProps = {
  type: 'internal' | 'external'
  documentId: string
  destinationList?: DestinationVM[]
  maxDisplaySize?: number
}
type ModalViewProcessHistory = InstanceType<typeof ModalViewDestinationProcessHistory>

const { destinationList = [], type, maxDisplaySize = 5 } = defineProps<TProps>()

const modalViewDestinationProcessHistory = useTemplateRef<ModalViewProcessHistory | null>(
  'modalViewDestinationProcessHistory'
)
const isExpand = ref(false)

const handleToggleShowMore = () => {
  isExpand.value = !isExpand.value
}

const filterDestinationByType = computed(() => {
  if (type === 'internal')
    return destinationList?.filter((destination) => !destination?.isUnitExternal)
  return destinationList?.filter((destination) => destination?.isUnitExternal)
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
      class="mb-2 flex flex-col items-end"
      :key="idx"
    >
      <div class="flex items-start gap-2">
        <DistributeRoleTag v-if="type === 'internal'" :role="destination?.role" class="shrink-0" />
        <div class="overflow-auto text-right">{{ destination?.name }}</div>
      </div>
      <div
        v-if="
          !!destination?.destinationStatus &&
          destination?.destinationStatus !== DESTINATION_STATUS_VALUES?.unsent
        "
        class="flex justify-end gap-2"
        :style="{
          color: DESTINATION_STATUS_DISPLAY?.[destination?.destinationStatus]?.color
        }"
      >
        <span
          class="text-primary cursor-pointer underline"
          v-if="
            destination?.destinationType === RECEIVER_TYPES.UNIT && !destination?.isUnitExternal
          "
          @click="modalViewDestinationProcessHistory?.openModal(documentId, destination)"
          >Xem lịch sử</span
        >
        <span
          class="mt-1 inline-block"
          :class="DESTINATION_STATUS_DISPLAY?.[destination?.destinationStatus]?.icClass"
        ></span>
        {{ DESTINATION_STATUS_DISPLAY?.[destination?.destinationStatus]?.label }}
      </div>
    </div>
    <span
      v-if="filterDestinationByType?.length > maxDisplaySize"
      class="text-primary items-self-end cursor-pointer font-semibold underline"
      @click.stop="handleToggleShowMore"
      >{{ isExpand ? 'Ẩn bớt' : 'Xem thêm' }}</span
    >
    <ModalViewDestinationProcessHistory ref="modalViewDestinationProcessHistory" />
  </div>
</template>
