<script setup lang="ts">
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTabs from '@/shared/components/AppTabs.vue'
import type { TAppTab } from '@/shared/models/common'
import TaskTable from '../components/TaskTable.vue'
import { useTaskCommonFilter } from '../composable/useTaskCommonFilter'
import type { TTaskStatus } from '../models/type'

const tabList: TAppTab<TTaskStatus>[] = [
  {
    label: 'Đang thực hiện',
    value: 'PROCESSING'
  },
  {
    label: 'Đã hoàn thành',
    value: 'COMPLETED'
  }
]

const { filterParams, selectTab, handleFilter, handleResetFilter } = useTaskCommonFilter(tabList)
</script>

<template>
  <div class="h-full">
    <div class="mb-4 flex items-center justify-between">
      <AppTabs :tab-list="tabList" v-model="selectTab" @update:model-value="handleResetFilter" />
      <AppFilterBarWithSearch
        class="flex items-center justify-end gap-2"
        placeholder="Tìm kiếm theo tên từ khóa"
        :search-string="filterParams.search"
        @search="(val) => handleFilter({ search: val })"
      >
      </AppFilterBarWithSearch>
    </div>
    <div class="mt-8">
      <TaskTable :active-tab="selectTab!" :filterParams="filterParams" />
    </div>
  </div>
</template>
