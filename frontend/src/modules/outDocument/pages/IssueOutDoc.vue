<script setup lang="ts">
import { router } from '@/router'
import AppTabs from '@/shared/components/AppTabs.vue'
import OutDocumentFilter from '@/shared/components/outDoc/OutDocumentFilter.vue'
import { useOutdocCommonFilter } from '@/shared/composables/useOutdocCommonFilter'
import type { TAppTab } from '@/shared/models/common'
import {
  OUT_DOC_ISSUED_STATUS_VALUES,
  type TIssueDocStatusValue
} from '@/shared/models/outDoc/document'
import IssuedUnitODTable from '../components/IssuedUnitODTable.vue'
import RejectedAllocateODTable from '../components/RejectedAllocateODTable.vue'
import WaitAllocateODTable from '../components/WaitAllocateODTable.vue'
import WaitSendUnitODTable from '../components/WaitSendUnitODTable.vue'

const tabList: TAppTab<TIssueDocStatusValue>[] = [
  {
    label: 'Chờ cấp số',
    value: 'WAITING_NUMBERING'
  },
  {
    label: 'Chờ gửi',
    value: 'WAITING_SENDING'
  },
  {
    label: 'Đã cấp số',
    value: 'NUMBERED'
  },
  {
    label: 'Đã trả lại',
    value: 'RETURNED'
  }
]

const { filterParams, selectTab, handleFilter, handleResetFilter } = useOutdocCommonFilter(tabList)
const handleChangeTab = () => {
  handleResetFilter()
  router.push({
    query: {
      tab: selectTab.value
    }
  })
}
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between gap-4">
      <AppTabs v-model="selectTab" @update:model-value="handleChangeTab" :tab-list="tabList" />
      <OutDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <WaitAllocateODTable
        v-if="selectTab === OUT_DOC_ISSUED_STATUS_VALUES.waitingNumbering"
        :filterParams="filterParams"
      />
      <WaitSendUnitODTable
        v-if="selectTab === OUT_DOC_ISSUED_STATUS_VALUES.waitingSending"
        :filterParams="filterParams"
      />
      <IssuedUnitODTable
        v-if="selectTab === OUT_DOC_ISSUED_STATUS_VALUES.numbered"
        :filterParams="filterParams"
      />
      <RejectedAllocateODTable
        v-if="selectTab === OUT_DOC_ISSUED_STATUS_VALUES.returned"
        :filterParams="filterParams"
      />
    </div>
  </div>
</template>

<style scoped></style>
