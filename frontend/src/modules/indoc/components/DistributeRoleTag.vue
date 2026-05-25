<script setup lang="ts">
import { DOCUMENT_PROCESS_ROLES } from '@/shared/constants/document'
import type { TDistributeRole } from '@/shared/models/common'
import { getDisplayValueForDistributeRole } from '../utils/distributeUtils'

type TProps = {
  role: TDistributeRole
}
const { role } = defineProps<TProps>()

const getTagStyle = (role: TDistributeRole) => {
  if (role === DOCUMENT_PROCESS_ROLES.Director)
    return {
      backgroundColor: '#E6CCFF',
      color: '#6554C0'
    }
  else if (role === DOCUMENT_PROCESS_ROLES.Leader)
    return {
      backgroundColor: '#DEEBFF',
      color: '#0052CC'
    }
  else if (role === DOCUMENT_PROCESS_ROLES.Collaborator)
    return {
      backgroundColor: '#C8F8FF',
      color: '#00C7E6'
    }
  else
    return {
      backgroundColor: '#ccffe3',
      color: '#6cc054'
    }
}
</script>
<template>
  <div :style="getTagStyle(role)" class="inline-flex rounded-lg px-1.5 py-0.5 font-semibold">
    {{ getDisplayValueForDistributeRole(role) ?? '' }}
  </div>
</template>
