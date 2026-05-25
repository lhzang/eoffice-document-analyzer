<script setup lang="ts" generic="TTabValueType extends string">
import { Tab, TabList, Tabs } from 'primevue'
import type { TAppTab } from '../models/common'

type TProps = {
  tabList: TAppTab<TTabValueType>[]
  tabListClass?: string
  scrollable?: boolean
}
const { tabList, scrollable = false } = defineProps<TProps>()

const modelValue = defineModel<TTabValueType | null>({ required: true })

const handleChangeTab = (value: string | number) => {
  const newTabValue = value as TTabValueType
  modelValue.value = newTabValue
}
</script>
<template>
  <Tabs :scrollable :value="modelValue ?? tabList?.[0]?.value" @update:value="handleChangeTab">
    <TabList class="flex max-w-full gap-2" :class="tabListClass">
      <Tab
        class="!cursor-pointer !py-2 text-center font-medium whitespace-nowrap"
        v-for="(tab, idx) of tabList"
        :key="idx"
        :value="tab.value"
        >{{ tab.label }}</Tab
      >
    </TabList>
  </Tabs>
</template>
