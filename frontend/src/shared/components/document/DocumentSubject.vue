<script setup lang="ts">
import PriorityLevelComponent from '@/modules/indoc/components/PriorityLevelComponent.vue'
import { UrgentLevelsEnum } from '@/shared/constants/document'
import type { TUrgencyLevelValue } from '@/shared/models/document'
import AppLongText from '../AppLongText.vue'

type TProps = {
  subject: string
  urgentLevel: TUrgencyLevelValue
}

const { subject, urgentLevel } = defineProps<TProps>()
</script>

<template>
  <div>
    <AppLongText :text="subject" :splice-length="230" />
    <PriorityLevelComponent
      :priority="urgentLevel"
      :excludePriorities="[UrgentLevelsEnum.Normal]"
    />
  </div>
</template>
