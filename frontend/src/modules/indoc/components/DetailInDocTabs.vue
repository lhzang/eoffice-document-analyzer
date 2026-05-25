<script setup lang="ts">
import { Tab, TabList, Tabs } from 'primevue'
import { ref } from 'vue'
import { DETAIL_DOCUMENT_TABS } from '../composables/useTabModalDetail'

export type TDetailDocumentTabs = keyof typeof DETAIL_DOCUMENT_TABS

const props = withDefaults(
  defineProps<{
    initialTabs: TDetailDocumentTabs[]
  }>(),
  {
    initialTabs: () => ['info']
  }
)

const selectedTab = ref<TDetailDocumentTabs>('info')

const defaultSelectedTab = (tab: TDetailDocumentTabs) => {
  selectedTab.value = tab
}

defineExpose({
  selectedTab,
  defaultSelectedTab
})
</script>
<template>
  <div>
    <Tabs v-model:value="selectedTab" scrollable>
      <TabList class="flex gap-2">
        <Tab
          :class="[
            '!py-2 text-center font-medium whitespace-nowrap',
            props.initialTabs.length > 1 ? '!cursor-pointer' : 'pointer-events-none !cursor-default'
          ]"
          v-for="(tab, tabIdx) in props.initialTabs"
          :key="tabIdx"
          :value="tab"
          >{{ DETAIL_DOCUMENT_TABS?.[tab] }}</Tab
        >
      </TabList>
    </Tabs>
  </div>
</template>
