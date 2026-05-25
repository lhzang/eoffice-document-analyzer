<script setup lang="ts">
import { OUT_DOC_STATUS_DISPLAY } from '@/shared/models/outDoc/document'
import type { ListDocumentVMStatusEnum } from '@/shared/services/api'

type TProps = {
  documentStatus: ListDocumentVMStatusEnum
}

const { documentStatus } = defineProps<TProps>()
</script>
<template>
  <div
    class="w-fit rounded-md p-2 font-semibold"
    :style="{
      color: OUT_DOC_STATUS_DISPLAY?.[documentStatus]?.color,
      background: OUT_DOC_STATUS_DISPLAY?.[documentStatus]?.background
    }"
  >
    {{ OUT_DOC_STATUS_DISPLAY?.[documentStatus]?.label }}
  </div>
</template>
