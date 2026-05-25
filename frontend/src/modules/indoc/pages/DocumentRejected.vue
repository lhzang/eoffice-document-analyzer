<script setup lang="ts">
import DocumentRejectedList from '../components/DocumentRejectedList.vue'
import InDocumentFilter from '../components/InDocumentFilter.vue'
import { useInDocCommonFilter } from '../composables/useIndocCommonFilter'

const { filterParams, handleFilter } = useInDocCommonFilter()
</script>

<template>
  <div class="wrapper-wait-incoming-doc h-full">
    <div class="flex items-center justify-end">
      <InDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <DocumentRejectedList :filterParams="filterParams" />
    </div>
  </div>
</template>

<style scoped></style>
