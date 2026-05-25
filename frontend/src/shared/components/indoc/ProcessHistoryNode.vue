<script setup lang="ts">
import ProcessHistoryRootNodeEvent from '@/shared/components/indoc/ProcessHistoryRootNodeEvent.vue'
import { useGetDetailHistoryNode } from '@/shared/composables/queries/indoc/useGetDetailHistoryNode'
import {
  DOCUMENT_PROCESS_ROLES_LABELS,
  type TDocumentProcessRole
} from '@/shared/constants/document'
import {
  INDOC_DOC_STATUS,
  INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY,
  type TIndocDocStatus
} from '@/shared/constants/indoc'
import type { TraceabilityNodeVM } from '@/shared/services/api'
import { groupEventsWithSameActor } from '@/shared/utils/document'
import { computed, ref } from 'vue'

type TProps = {
  nodeValue: TraceabilityNodeVM
  level: number
}
const { nodeValue, level } = defineProps<TProps>()
const isExpanded = ref(false)

const {
  data: detailDistributeNode,
  isLoading: isGettingDetailDistributeNode,
  refetch: reGettingDetailDistributeNode
} = useGetDetailHistoryNode(
  () => nodeValue?.targetId!!,
  () => nodeValue?.type!!,
  {
    enabled: () => false
  }
)

const groupedDetailDistributeNodeEvents = computed(() =>
  groupEventsWithSameActor(detailDistributeNode?.value?.events ?? [])
)

const handleClickExpand = () => {
  isExpanded.value = !isExpanded.value
  if (
    !!nodeValue?.targetId &&
    !!nodeValue?.type &&
    isExpanded?.value &&
    !detailDistributeNode?.value
  ) {
    reGettingDetailDistributeNode()
  }
}
</script>
<template>
  <div>
    <div
      @click="handleClickExpand"
      class="flex cursor-pointer items-center gap-2"
      :style="{ marginLeft: level * 20 + 'px' }"
    >
      <!-- :style="{ marginLeft: level * 20 + 'px' }" -->
      <span class="icon-[mdi--tick-circle] text-primary shrink-0"></span>
      <span class="truncate font-semibold"
        >{{ nodeValue?.label }}({{
          DOCUMENT_PROCESS_ROLES_LABELS[nodeValue?.role as TDocumentProcessRole]
        }})</span
      >
      <span
        v-if="(nodeValue?.status as TIndocDocStatus) === INDOC_DOC_STATUS.Revoked"
        class="icon-[gg--close-o] shrink-0 text-red-500"
      ></span>
      <span
        v-if="isGettingDetailDistributeNode"
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
      v-if="nodeValue?.type === 'UNIT'"
      class="flex items-center gap-2"
      :style="{
        color: INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[nodeValue?.status as TIndocDocStatus].color,
        marginLeft: (level + 1) * 20 + 'px'
      }"
    >
      <span
        :class="INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[nodeValue?.status as TIndocDocStatus].icon"
      ></span>
      <span>{{
        INDOC_DOC_STATUS_PROCESS_HISTORY_DISPLAY[nodeValue?.status as TIndocDocStatus].title
      }}</span>
    </div>
    <div v-if="isExpanded && detailDistributeNode">
      <ProcessHistoryRootNodeEvent
        v-for="(value, idx) in groupedDetailDistributeNodeEvents"
        :event="value"
        :key="idx"
        :preFetch="false"
        :level="level + 1"
      ></ProcessHistoryRootNodeEvent>
      <ProcessHistoryNode
        v-for="(children, idx) in nodeValue?.children ?? []"
        :key="idx"
        :node-value="children"
        :level="level + 2"
      />
    </div>
  </div>
</template>
