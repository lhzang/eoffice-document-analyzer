<script setup lang="ts">
import AppTabs from '@/shared/components/AppTabs.vue'
import OutDocumentFilter from '@/shared/components/outDoc/OutDocumentFilter.vue'
import { useOutdocCommonFilter } from '@/shared/composables/useOutdocCommonFilter'
import type { TAppTab } from '@/shared/models/common'
import WaitForProcessInternalDocTable from '../components/WaitForProcessInternalDocTable.vue'
import type { TWaitForProcessStatusValue } from '../models/document'

const tabList: TAppTab<TWaitForProcessStatusValue>[] = [
  {
    label: 'Chờ xử lý',
    value: 'WAITING_PROCESSING'
  },
  {
    label: 'Đã xử lý',
    value: 'PROCESSED'
  }
]

const { filterParams, selectTab, handleFilter, handleResetFilter } = useOutdocCommonFilter(tabList)
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between gap-4">
      <AppTabs v-model="selectTab" @update:model-value="handleResetFilter" :tab-list="tabList" />
      <OutDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <WaitForProcessInternalDocTable :active-tab="selectTab!" :filterParams="filterParams" />
    </div>
  </div>
</template>

<style scoped></style>
