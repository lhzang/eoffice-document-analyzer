<script setup lang="ts">
import { OUT_DOCUMENT_TYPES } from '@/shared/models/outDoc/document'
import type { ListDocumentVM } from '@/shared/services/api'

type TProps = {
  document: ListDocumentVM
}

const { document } = defineProps<TProps>()
</script>
<template>
  <span
    v-if="document?.outDocType === OUT_DOCUMENT_TYPES.digital"
    v-tippy="'Văn bản đi ký số'"
    class="icon-[hugeicons--document-attachment] text-xl text-sky-500"
  ></span>
  <span
    v-if="document?.outDocType === OUT_DOCUMENT_TYPES.paper"
    v-tippy="'Văn bản đi ký giấy'"
    class="icon-[solar--document-add-linear] text-xl text-red-500"
  ></span>
</template>
