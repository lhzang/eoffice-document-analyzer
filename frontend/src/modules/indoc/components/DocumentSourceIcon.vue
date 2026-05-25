<script setup lang="ts">
import LogoXroad from '@/assets/icons/xroad_logo.svg'
import type { InDocDocumentVM } from '@/shared/services/api'
import { Tippy } from 'vue-tippy'

type TProps = {
  document: InDocDocumentVM
}

const { document } = defineProps<TProps>()
</script>
<template>
  <Tippy
    class="item-center flex justify-center"
    v-if="document?.sourceType === 'INDOC' && !document?.sourceDocId"
    content="Văn bản đến giấy"
  >
    <span
      style="width: 16px; height: 16px"
      class="icon-[solar--document-add-linear] text-xl font-semibold text-red-500"
    ></span>
  </Tippy>
  <Tippy
    class="item-center flex justify-center"
    v-else-if="document?.sourceType === 'EXTERNAL'"
    content="Văn bản đến từ trục liên thông"
  >
    <span class="item-center flex">
      <img :src="LogoXroad" class="h-[16px] w-[16px] object-contain" alt="logo" />
    </span>
  </Tippy>
  <Tippy class="item-center flex justify-center" v-else content="Văn bản đến qua mạng">
    <span
      style="width: 16px; height: 16px"
      class="icon-[carbon--document-processor] text-xl font-semibold text-sky-500"
    ></span>
  </Tippy>
</template>
