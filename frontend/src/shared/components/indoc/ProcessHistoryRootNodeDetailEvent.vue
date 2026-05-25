<script setup lang="ts">
import AppLongText from '@/shared/components/AppLongText.vue'
import DistributeListDisplay from '@/shared/components/document/DistributeListDisplay.vue'
import DumbFilePreviewLabel from '@/shared/components/DumbFilePreviewLabel.vue'
import ModalPreviewFile from '@/shared/components/ModalPreviewFile.vue'
import { DOCUMENT_PROCESS_ROLES_LABELS, RECEIVER_TYPES } from '@/shared/constants/document'
import {
  INDOC_EVENT_LABEL,
  INDOC_PROCESS_EVENT_TYPE,
  type TIndocDocProcessEventType
} from '@/shared/constants/indoc'
import type { TDocumentProcessValue } from '@/shared/models/document'
import type { TProcessHistoryEventItem } from '@/shared/models/indoc'
import { DateTime } from 'luxon'
import { computed, ref } from 'vue'
import { Tippy } from 'vue-tippy'
type TPreviewModalRef = InstanceType<typeof ModalPreviewFile>

type TProps = {
  eventItem: TProcessHistoryEventItem
  isIndent?: boolean
  level: number
}
const { eventItem, isIndent = true, level } = defineProps<TProps>()
const previewModalRef = ref<TPreviewModalRef | null>(null)

const actionName = computed(() => eventItem?.actionName as TIndocDocProcessEventType)
const reasonMessage = computed(() => {
  if (
    actionName?.value === INDOC_PROCESS_EVENT_TYPE.IncomingDocumentRevoked ||
    actionName?.value === INDOC_PROCESS_EVENT_TYPE.StaffRevoked
  )
    return 'Lý do thu hồi'
  return 'Ý kiến chỉ đạo'
})

const distributeList = computed(
  () =>
    eventItem?.receivers?.map((receiver) => ({
      subjectName: receiver?.displayName,
      action: receiver?.role
    })) as TDocumentProcessValue[]
)
</script>
<template>
  <div :style="{ marginLeft: (isIndent ? level : level - 1) * 20 + 'px' }">
    <!-- action -->
    <div class="flex items-center justify-between">
      <span>{{ INDOC_EVENT_LABEL[actionName] }}</span>
      <span class="font-semibold">
        {{ DateTime.fromISO(eventItem?.timestamp).toFormat('HH:mm - dd/MM/yyyy') }}
      </span>
    </div>
    <!-- distribute/assign list -->
    <DistributeListDisplay
      v-if="
        distributeList?.length > 0 &&
        (actionName === INDOC_PROCESS_EVENT_TYPE.DocumentDistributed ||
          actionName === INDOC_PROCESS_EVENT_TYPE.IncomingDocumentRevoked ||
          actionName === INDOC_PROCESS_EVENT_TYPE.StaffRevoked)
      "
      class="ml-[20px] min-h-auto p-0!"
      :itemList="distributeList"
    />
    <template
      v-if="
        actionName === INDOC_PROCESS_EVENT_TYPE.StaffAssigned ||
        actionName === INDOC_PROCESS_EVENT_TYPE.StaffDelegated
      "
    >
      <Tippy
        v-for="(assignee, idx) in eventItem?.receivers"
        :key="idx"
        placement="left-start"
        :allowHTML="true"
      >
        <template #content v-if="assignee?.type === RECEIVER_TYPES.STAFF">
          <div class="max-w-50">
            Vị trí: <span class="font-semibold">{{ assignee?.title }}</span> thuộc
            <span class="font-semibold">{{ assignee?.unit }}</span>
          </div>
        </template>
        <div class="flex items-center gap-2">
          <span class="icon-[stash--user-group] shrink-0"></span>
          <span class="truncate">{{ assignee?.displayName }}</span>
          <span class="shrink-0">({{ DOCUMENT_PROCESS_ROLES_LABELS[assignee?.role] }})</span>
        </div>
      </Tippy>
    </template>
    <div v-if="eventItem?.message">
      <Tippy :content="reasonMessage" class="flex items-start gap-2" placement="left-start">
        <span class="icon-[hugeicons--message-01] mt-1.5 inline-block"></span>
        <AppLongText is-show-read-more is-show-tooltips :text="eventItem?.message" />
      </Tippy>
    </div>
    <div class="max-h-[200px] w-full truncate overflow-auto">
      <DumbFilePreviewLabel
        v-for="(file, idx) in eventItem?.files"
        :key="idx"
        :relative-url="file"
        :show-preview="true"
        labelClass="flex-initial! text-undeline text-primary italic"
        @show-preview="(url, name) => previewModalRef?.openModal(url, name)"
      />
      <ModalPreviewFile v-if="eventItem?.files?.length" ref="previewModalRef" />
    </div>
  </div>
</template>
