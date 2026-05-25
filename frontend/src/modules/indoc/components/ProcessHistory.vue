<script setup lang="ts">
import { useGetListSameSourceDocs } from '../composables/queries/useGetListSameSourceDocs'
import ProcessHistoryRootNode from './ProcessHistoryRootNode.vue'

type TProps = {
  documentId: string
}
const { documentId } = defineProps<TProps>()

const {
  data: sameSourceDocs,
  isLoading: isGettingSameSourceDoc,
  error: gettingSameSourceDocError
} = useGetListSameSourceDocs(() => documentId, {
  enabled: () => !!documentId
})
</script>
<template>
  <div v-if="isGettingSameSourceDoc" class="flex h-full items-center justify-center">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div v-else-if="gettingSameSourceDocError">
    {{
      gettingSameSourceDocError?.response?.data?.detail ??
      gettingSameSourceDocError?.message ??
      'Có lỗi xảy ra khi lấy thông tin lịch sử xử lý'
    }}
  </div>
  <div v-else class="px-4 py-2">
    <div v-if="!sameSourceDocs?.length" class="flex h-full items-center justify-center">
      Chưa có lịch sử xử lý
    </div>
    <template v-else>
      <ProcessHistoryRootNode
        v-for="(doc, idx) in sameSourceDocs"
        :document="doc"
        :key="idx"
        :pre-fetch="doc?.documentId === documentId"
        :level="0"
      ></ProcessHistoryRootNode>
    </template>
  </div>
</template>
