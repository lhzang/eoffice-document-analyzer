<script setup lang="ts">
import type { TAssignedUserRoles } from '@/modules/indoc/models/types'
import { computed } from 'vue'

const { role } = defineProps<{
  role: TAssignedUserRoles
}>()

const generateTitleHistory = computed(() => {
  switch (role) {
    case 'Director':
      return { title: 'Chỉ đạo', color: '#6554C0', bgc: '#E6CCFF' }
    case 'Host':
      return { title: 'Chủ trì', color: '#0052CC', bgc: '#DEEBFF' }
    case 'Coordinator':
      return { title: 'Phối hợp', color: '#00C7E6', bgc: '#C8F8FF' }
    default:
      return { title: 'Xem để biết', color: '#6cc054', bgc: '#ccffe3' }
  }
})
</script>
<template>
  <span
    class="inline-flex rounded-[8px] px-[6px] py-[1px] font-semibold"
    :style="{
      color: generateTitleHistory.color,
      backgroundColor: generateTitleHistory.bgc
    }"
  >
    {{ generateTitleHistory.title }}
  </span>
</template>

<style scoped></style>
