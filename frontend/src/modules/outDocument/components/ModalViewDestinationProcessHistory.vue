<script setup lang="ts">
import ProcessHistoryNode from '@/shared/components/indoc/ProcessHistoryNode.vue'
import ProcessHistoryRootNodeEvent from '@/shared/components/indoc/ProcessHistoryRootNodeEvent.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetDetailHistoryNode } from '@/shared/composables/queries/indoc/useGetDetailHistoryNode'
import { type DestinationVM } from '@/shared/services/api'
import { groupEventsWithSameActor } from '@/shared/utils/document'
import { computed, ref } from 'vue'
import { useGetDestinationProcessHistory } from '../composables/queries/useGetDestinationProcessHistory'

const isVisible = ref<boolean>(false)
const destination = ref<DestinationVM>()
const documentId = ref<string>()

const { data: tracibilityTree, isLoading: isGettingTracibilityTree } =
  useGetDestinationProcessHistory(
    () => documentId?.value!,
    () => destination?.value?.id!,
    {
      enabled: () => !!destination?.value?.id && isVisible?.value && !!documentId.value
    }
  )
const { data: detailDistributeNode, isLoading: isGettingDetailDistributeNode } =
  useGetDetailHistoryNode(
    () => tracibilityTree?.value?.targetId!,
    () => tracibilityTree?.value?.type!,
    {
      enabled: () =>
        !!tracibilityTree?.value?.targetId && !!tracibilityTree?.value?.type && isVisible?.value
    }
  )
const groupedDetailDistributeNodeEvents = computed(
  () => groupEventsWithSameActor(detailDistributeNode?.value?.events ?? []) ?? []
)

const handleWhenModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    destination.value = undefined
    documentId.value = undefined
  }
}

defineExpose({
  openModal: (docId: string, selectedDestination: DestinationVM) => {
    destination.value = selectedDestination
    documentId.value = docId
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    :title="`Quá trình xử lý văn bản của ${destination?.name}`"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :is-loading="isGettingDetailDistributeNode || isGettingTracibilityTree"
    :wrapper-style="{ width: '60%' }"
  >
    <div>
      <div class="ml-[20px]" v-if="detailDistributeNode">
        <ProcessHistoryRootNodeEvent
          v-for="(value, idx) in groupedDetailDistributeNodeEvents"
          :event="value"
          :key="idx"
          preFetch
          :level="0"
        ></ProcessHistoryRootNodeEvent>
        <ProcessHistoryNode
          v-for="(children, idx) in tracibilityTree?.children ?? []"
          :key="idx"
          :node-value="children"
          :level="0"
        />
      </div>
    </div>
  </AppModal>
</template>
