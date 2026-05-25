<script setup lang="ts">
import { computed } from 'vue'

import { useGetCreationHistoryID } from '@/modules/indoc/composables/queries/useGetCreationHistoryID'
import type { SourceInfo } from '@/shared/services/api'
import CreationHistoryItem from './CreationHistoryItem.vue'

type TProps = {
  documentId: string
  sourceInfo: SourceInfo
}

const { documentId, sourceInfo } = defineProps<TProps>()

const {
  data: eventList,
  error: getProcessHistoryError,
  isLoading: isGettingCreationHistory
} = useGetCreationHistoryID(() => documentId)
const displayEventList = computed(() => {
  if (!sourceInfo?.sourceDocId)
    return eventList.value?.filter((event) => event.actionName !== 'INCOMINGDOCUMENTREGISTERED')
  return eventList.value
})
</script>
<template>
  <div v-if="isGettingCreationHistory" class="flex h-full items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else-if="getProcessHistoryError" class="flex h-full items-center justify-center">
    {{
      getProcessHistoryError?.response?.data?.detail ??
      getProcessHistoryError?.message ??
      'Có lỗi xảy ra khi lấy lịch sử tạo văn bản'
    }}
  </div>
  <div class="flex h-full w-full items-center justify-center" v-else-if="!displayEventList?.length">
    Văn bản chưa có lịch sử tạo
  </div>
  <div v-else class="mt-1 mb-3 flex max-h-full flex-1 flex-col overflow-y-auto px-4 py-2 pr-2">
    <div v-for="(historyItem, historyItemIdx) in displayEventList" :key="historyItemIdx">
      <CreationHistoryItem :history-item="historyItem" :index="historyItemIdx" />
    </div>
  </div>
</template>

<style scoped></style>
