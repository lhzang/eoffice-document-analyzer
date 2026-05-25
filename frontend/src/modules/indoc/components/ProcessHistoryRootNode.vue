<script setup lang="ts">
import ProcessHistoryNode from '@/shared/components/indoc/ProcessHistoryNode.vue'
import {
  INDOC_DOC_STATUS,
  INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY,
  type TIndocDocStatus
} from '@/shared/constants/indoc'
import type { SameOriginItem } from '@/shared/services/api'
import { groupEventsWithSameActor } from '@/shared/utils/document'
import { computed, ref } from 'vue'
import ProcessHistoryRootNodeEvent from '../../../shared/components/indoc/ProcessHistoryRootNodeEvent.vue'
import { useGetDetailHistoryNode } from '../../../shared/composables/queries/indoc/useGetDetailHistoryNode'
import { useGetTraceInDoc } from '../composables/queries/useGetTraceInDoc'

type TProps = {
  document: SameOriginItem
  preFetch: boolean
  level: number
}
const { preFetch, document, level } = defineProps<TProps>()
const isExpanded = ref(false)
const {
  data: tracibilityTree,
  isLoading: isGettingTracibilityTree,
  refetch: reGettingTracibilityTree
} = useGetTraceInDoc(
  () => document?.documentId!,
  () => (document?.type === 'STAFF' ? document.id : undefined),
  {
    enabled: () => !!document?.documentId && isExpanded.value
  }
)
const { data: detailDistributeNode, isLoading: isGettingDetailDistributeNode } =
  useGetDetailHistoryNode(
    () => tracibilityTree?.value?.targetId!,
    () => tracibilityTree?.value?.type!,
    {
      enabled: () =>
        !!document?.documentId &&
        !!tracibilityTree?.value?.targetId &&
        !!tracibilityTree?.value?.type
    }
  )
const groupedDetailDistributeNodeEvents = computed(
  () => groupEventsWithSameActor(detailDistributeNode?.value?.events ?? []) ?? []
)
const handleClickExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !tracibilityTree.value) {
    reGettingTracibilityTree()
  }
}
</script>
<template>
  <div>
    <div @click="handleClickExpand" class="flex cursor-pointer items-center gap-2">
      <span class="icon-[mdi--tick-circle] text-primary shrink-0"></span>
      <span class="truncate font-semibold">{{ document?.displayName }}</span>
      <span
        v-if="document?.status === INDOC_DOC_STATUS.Revoked"
        class="icon-[gg--close-o] shrink-0 text-red-500"
      ></span>
      <span
        v-if="isGettingDetailDistributeNode || isGettingTracibilityTree"
        class="icon-[line-md--loading-twotone-loop] text-primary"
      ></span>
      <template v-else>
        <span
          v-if="isExpanded"
          class="icon-[ic--round-keyboard-arrow-down] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
        <span
          v-else
          class="icon-[ic--round-keyboard-arrow-right] focus:text-primary shrink-0 text-lg text-inherit"
        ></span>
      </template>
    </div>
    <div
      class="ml-[20px] flex items-center gap-2"
      v-if="document?.type === 'UNIT'"
      :style="{
        color: INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[document?.status as TIndocDocStatus].color
      }"
    >
      <span
        :class="INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[document?.status as TIndocDocStatus].icon"
      ></span>
      <span>{{
        INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[document?.status as TIndocDocStatus].title
      }}</span>
    </div>

    <div v-if="isExpanded && detailDistributeNode">
      <ProcessHistoryRootNodeEvent
        v-for="(value, idx) in groupedDetailDistributeNodeEvents"
        :event="value"
        :key="idx"
        :level="level + 1"
        :preFetch
      ></ProcessHistoryRootNodeEvent>
      <ProcessHistoryNode
        v-for="(children, idx) in tracibilityTree?.children ?? []"
        :key="idx"
        :node-value="children"
        :document-id="document?.documentId"
        :level="level + 2"
      />
    </div>
  </div>
</template>
