<script setup lang="ts">
import DocumentFromInternetList from '../components/DocumentFromInternetList.vue'
import InDocumentFilter from '../components/InDocumentFilter.vue'

import AppTabs from '@/shared/components/AppTabs.vue'
import type { TAppTab } from '@/shared/models/common'
import { useInDocCommonFilter } from '../composables/useIndocCommonFilter'
import type { TDocumentFromInternetTabs } from '../models/types'

const tabList: TAppTab<TDocumentFromInternetTabs>[] = [
  {
    label: 'Cần nhập sổ',
    value: 'WAIT_FOR_PROCESSING'
  },
  {
    label: 'Đã xử lý',
    value: 'PROCESSED'
  }
]

const { filterParams, selectTab, handleFilter, handleResetFilter } = useInDocCommonFilter(tabList)
</script>

<template>
  <div class="wrapper-wait-incoming-doc h-full">
    <div class="flex items-center justify-between gap-4">
      <AppTabs v-model="selectTab" :tab-list="tabList" @update:model-value="handleResetFilter" />
      <InDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <DocumentFromInternetList :active-tab="selectTab!" :filterParams="filterParams" />
    </div>
  </div>
</template>

<style scoped></style>
