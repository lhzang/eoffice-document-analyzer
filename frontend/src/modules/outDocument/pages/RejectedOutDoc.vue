<script setup lang="ts">
import OutDocumentFilter from '@/shared/components/outDoc/OutDocumentFilter.vue'
import { useOutdocCommonFilter } from '@/shared/composables/useOutdocCommonFilter'
import RejectedOutDocTable from '../components/RejectedOutDocTable.vue'

const { filterParams, handleFilter } = useOutdocCommonFilter()
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-end gap-4">
      <OutDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <RejectedOutDocTable :filterParams="filterParams" />
    </div>
  </div>
</template>

<style scoped></style>
