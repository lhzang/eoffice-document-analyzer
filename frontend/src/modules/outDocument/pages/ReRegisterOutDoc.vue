<script setup lang="ts">
import { OUT_DOCUMENT_TYPES } from '@/shared/models/outDoc/document'
import { useRoute } from 'vue-router'
import { useGetDetailOutDoc } from '../composables/queries/useGetDetailOutDoc'
import ReRegisterEOutDoc from './ReRegisterEOutDoc.vue'
import ReRegisterPaperOutDoc from './ReRegisterPaperOutDoc.vue'

const route = useRoute()

const {
  data: detailOutDoc,
  isLoading: isGettingDocInfo,
  isSuccess: isGetDetailSuccess,
  error
} = useGetDetailOutDoc(() => route.params.id as string, {
  enabled: () => !!(route.params.id as string)
})
</script>
<template>
  <div class="h-full">
    <div v-if="isGettingDocInfo" class="flex h-full items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="error" class="flex h-full items-center justify-center">
      <span class="text-xl">{{
        error?.response?.data?.detail ?? error?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
      }}</span>
    </div>
    <template v-else-if="detailOutDoc">
      <ReRegisterPaperOutDoc
        v-if="detailOutDoc?.outDocType === OUT_DOCUMENT_TYPES.paper"
        :detailOutDoc="detailOutDoc"
        :isGetDetailSuccess="isGetDetailSuccess"
      />
      <ReRegisterEOutDoc
        v-else
        :detailOutDoc="detailOutDoc"
        :isGetDetailSuccess="isGetDetailSuccess"
      />
    </template>
  </div>
</template>
