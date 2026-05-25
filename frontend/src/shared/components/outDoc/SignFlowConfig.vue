<script setup lang="ts">
import type { TDocumentSignSteps } from '@/shared/models/outDoc/signer'
import { useFieldArray } from 'vee-validate'
import type z from 'zod'
import type { signStepSchema } from '../../schemas/signFlowSchema'
import SignFlowConfigItem from './SignFlowConfigItem.vue'

type TProps = {
  selectedFlow: TDocumentSignSteps
  type: 'internal' | 'out'
}

type TSignFlowStep = z.infer<typeof signStepSchema>

const { selectedFlow } = defineProps<TProps>()
const { fields } = useFieldArray<TSignFlowStep>('signFlow')
</script>
<template>
  <div class="card flex flex-col gap-4">
    <SignFlowConfigItem
      :selectedFlow
      v-for="(entry, idx) in fields"
      :type
      :index="idx"
      :key="idx"
      :stepData="entry.value"
    />
  </div>
</template>
