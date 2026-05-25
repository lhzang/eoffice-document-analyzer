<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { ref } from 'vue'

const isVisible = ref<boolean>(false)
const replacedDocId = ref<string>()

const handleWhenModalVisibleChange = (isVisible: boolean) => {
  if (!isVisible) {
    replacedDocId.value = undefined
  }
}

defineExpose({
  openModal: (docId?: string) => {
    replacedDocId.value = docId
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})
</script>
<template>
  <AppModal
    title="Thông báo"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :wrapper-style="{
      width: '400px',
      textAlign: 'center'
    }"
  >
    <div class="text-primary my-6" v-if="replacedDocId">
      Văn bản này đã được thay thể bởi một văn bản khác có số hiệu{{ ' ' }}
      <span class="font-semibold text-red-500">{{ replacedDocId }}</span
      >. Thầy/Cô vui lòng kiểm tra lại!
    </div>
    <div class="text-primary my-6" v-else>
      Văn bản này đã được thay thể bởi một văn bản khác. Thầy/Cô vui lòng kiểm tra lại!
    </div>
  </AppModal>
</template>
