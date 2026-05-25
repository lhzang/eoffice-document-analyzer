<script setup lang="ts">
import { DateTime } from 'luxon'

import DistributeListDisplay from '@/shared/components/document/DistributeListDisplay.vue'
import type { TDocumentProcessValue } from '@/shared/models/document'
import type { CreatedHistoryEventVM } from '@/shared/services/api'
import { computed } from 'vue'
import {
  CREATE_HISTORY_INDOC_ACTION_VALUES,
  CREATE_HISTORY_INDOC_LABEL
} from '../constants/availableActions'
import type { TIndocCreateHistoryActioName } from '../models/types'

const { historyItem, index } = defineProps<{
  historyItem: CreatedHistoryEventVM
  index: number
}>()
const distributeList = computed(
  () =>
    historyItem?.receivers?.map((receiver) => ({
      subjectName: receiver?.displayName,
      action: receiver?.role
    })) as TDocumentProcessValue[]
)
const actionDisplay = computed(() => {
  return CREATE_HISTORY_INDOC_LABEL?.[historyItem?.actionName as TIndocCreateHistoryActioName]
})
</script>
<template>
  <div class="flex content-start pb-[3px]">
    <div>
      <span class="icon-[lets-icons--check-fill] text-primary !text-xl"></span>
    </div>
    <div class="ml-1">
      <div>
        <span>
          {{ index + 1 }}.
          <span class="font-semibold">
            {{ historyItem?.displayName }}
          </span>
        </span>
        đã
        <span class="font-semibold">{{ actionDisplay }}</span>
        văn bản
        <span
          v-if="
            (historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.rejectIncomingDoc ||
              historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.revokeInternet ||
              historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.revokePaper) &&
            historyItem?.comment
          "
        >
          {{ ' ' }}với lý do: <b>{{ historyItem?.comment }} </b>
        </span>
        <span
          class="font-semibold"
          v-if="historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc"
          >{{ ' ' }}và chờ duyệt</span
        >
        <span v-if="historyItem?.timestamp">
          {{ ' ' }}lúc:
          <span class="font-semibold">
            {{ DateTime.fromISO(historyItem?.timestamp).toFormat('HH:mm - dd/MM/yyyy') }}
          </span>
        </span>
      </div>
      <template
        v-if="
          historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc ||
          historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.distributeDoc
        "
      >
        <div v-if="!historyItem?.receivers?.length" class="mt-[2px] ml-[1px]">
          Không có cán bộ được đề xuất để xử lý văn bản
        </div>
        <template v-else>
          <div class="mt-1 mb-[3px] font-medium">
            Cán bộ được
            {{
              historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.proposeDoc
                ? 'đề xuất'
                : historyItem?.actionName === CREATE_HISTORY_INDOC_ACTION_VALUES.distributeDoc
                  ? 'chỉ định'
                  : ''
            }}
            để xử lý văn bản:
          </div>
          <DistributeListDisplay :itemList="distributeList" />
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
