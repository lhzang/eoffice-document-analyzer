<script setup lang="ts">
import { computed, ref } from 'vue'

import { DOCUMENT_PROCESS_ROLES, type TDocumentProcessRole } from '@/shared/constants/document'
import { DESTINATION_STATUS_DISPLAY } from '@/shared/constants/outDoc/destination'
import type { DestinationVM } from '@/shared/services/api'
import DistributeRoleTag from './DistributeRoleTag.vue'

type TExpandToggle = TDocumentProcessRole | 'parent-toggle'
type TGroupedRole = {
  role: TDocumentProcessRole
  destinations: DestinationVM[]
}
const expandToggle = ref<Set<TDocumentProcessRole | 'parent-toggle'>>(new Set(['parent-toggle']))

const { destinations = [] } = defineProps<{
  destinations: Array<DestinationVM>
}>()

const groupedDestinationByRole = computed(() => {
  const map = new Map<TDocumentProcessRole, DestinationVM[]>()
  const listRoles = Object.values(DOCUMENT_PROCESS_ROLES)

  for (const role of listRoles) {
    map.set(role, [])
  }

  for (const item of destinations) {
    const group = map.get(item.role as TDocumentProcessRole)
    if (group) {
      group.push(item)
    }
  }

  const result: TGroupedRole[] = []

  for (const role of listRoles) {
    const destinations = map.get(role)
    if (destinations && destinations.length > 0) {
      result.push({ role, destinations })
    }
  }

  return result
})
console.log('🚀 ~ destinations:', destinations)

const toggleExpand = (id: TExpandToggle) => {
  console.log('🚀 ~ toggleExpand ~ expandToggle.value:', expandToggle.value)
  if (expandToggle.value.has(id)) {
    expandToggle.value.delete(id)
  } else {
    expandToggle.value.add(id)
  }
}
</script>
<template>
  <div class="mb-1 pb-3">
    <div class="mb-[5px] flex items-center" @click="() => toggleExpand('parent-toggle')">
      <span class="icon-[lets-icons--check-fill] text-primary text-xl"></span>
      <span class="mx-1 font-bold">Nơi nhận văn bản</span>
      <span
        v-if="expandToggle.has('parent-toggle')"
        class="icon-[fe--arrow-up] text-primary text-xs"
      ></span>
      <span v-else class="icon-[fe--arrow-down] text-primary text-xs"></span>
    </div>
    <template v-if="expandToggle.has('parent-toggle')">
      <div
        v-for="(destination, destinationIdx) of groupedDestinationByRole"
        :key="destinationIdx"
        class="mt-[10px] ml-[20px] flex"
      >
        <div class="flex-1/4 content-start">
          <div
            class="inline-flex items-center justify-self-start select-none"
            :style="{ cursor: destination.destinations.length > 7 ? 'pointer' : 'default' }"
            @click="() => destination.destinations.length > 7 && toggleExpand(destination.role)"
          >
            <DistributeRoleTag :role="destination.role" />
            <template v-if="destination.destinations.length > 7">
              <span
                v-if="expandToggle.has(destination.role)"
                class="icon-[fe--arrow-up] text-primary ml-1 text-xs"
              ></span>
              <span v-else class="icon-[fe--arrow-down] text-primary ml-1 text-xs"></span>
            </template>
          </div>
        </div>
        <div v-if="expandToggle.has(destination.role)" class="flex flex-3/4 flex-col">
          <div
            v-for="(des, desIdx) in destination.destinations"
            :key="desIdx"
            class="flex flex-3/4 flex-col"
          >
            <div class="flex flex-col">
              <div class="text-[14px] font-semibold">
                {{ des?.name }}
              </div>
              <div
                class="ml-[2px] flex items-center text-xs"
                :style="{
                  color: DESTINATION_STATUS_DISPLAY[des?.destinationStatus].color
                }"
              >
                <span
                  class="text-base"
                  :class="DESTINATION_STATUS_DISPLAY[des?.destinationStatus].icClass"
                ></span>
                <!-- <component :is="DESTINATION_STATUS_DISPLAY[des?.destinationStatus].icon" class="text-[16px]" /> -->
                <span class="ml-[5px] text-xs">{{
                  DESTINATION_STATUS_DISPLAY[des?.destinationStatus].label
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
