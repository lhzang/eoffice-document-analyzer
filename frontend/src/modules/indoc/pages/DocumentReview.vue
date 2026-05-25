<script setup lang="ts">
import InDocumentFilter from '../components/InDocumentFilter.vue'
import IDWaitForReview from '../components/WaitForReview.vue'

import AppTabs from '@/shared/components/AppTabs.vue'
import type { TAppTab } from '@/shared/models/common'
import { useInDocCommonFilter } from '../composables/useIndocCommonFilter'
import type { TIDNeedHandleStatus } from '../models/types'

const tabList: TAppTab<TIDNeedHandleStatus>[] = [
  {
    label: 'Chờ xử lý',
    value: 'WAIT_FOR_PROCESSING'
  },
  {
    label: 'Đang xử lý',
    value: 'PROCESSING'
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
      <AppTabs v-model="selectTab" @update:model-value="handleResetFilter" :tab-list="tabList" />
      <InDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <IDWaitForReview :active-tab="selectTab!" :filterParams="filterParams" />
    </div>
  </div>
</template>

<style scoped></style>
