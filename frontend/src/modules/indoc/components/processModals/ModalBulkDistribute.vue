<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import type { InDocDocumentVM } from '@/shared/services/api'
import { computed, ref } from 'vue'
import DistributeDocExecute from '../DistributeDocExecute.vue'
import DistributeDocSelect from '../DistributeDocSelect.vue'

const emit = defineEmits<{
  (e: 'distributeSucess'): void
}>()

const step = ref<1 | 2>(1)

const isVisible = ref<boolean>(false)
const selectedUnitId = ref<null | string>(null)
const selectedDocuments = ref<InDocDocumentVM[]>([])
const selectedDocumentIds = computed(() =>
  selectedDocuments?.value?.map((selectedDoc) => selectedDoc?.documentId)
)

const handleWhenModalVisibleChange = (visible: boolean) => {
  if (!visible) {
    selectedUnitId.value = null
    selectedDocuments.value = []
    step.value = 1
  }
}

const closeModal = () => {
  isVisible.value = false
}

const handleProcessAfterDistribute = () => {
  closeModal()
  emit('distributeSucess')
}

defineExpose({
  openModal: () => {
    isVisible.value = true
  },
  closeModal
})
</script>
<template>
  <AppModal
    title="Phân phối"
    v-model:visible="isVisible"
    @update:visible="handleWhenModalVisibleChange"
    :wrapper-style="{ width: '95%' }"
  >
    <DistributeDocSelect
      v-if="step === 1"
      @cancel-distribute="closeModal()"
      v-model:selected-unit-id="selectedUnitId"
      v-model:selected-documents="selectedDocuments"
      @next-step="step = 2"
    />
    <DistributeDocExecute
      :selectedUnitId
      :document-ids="selectedDocumentIds"
      v-if="step === 2 && selectedUnitId && selectedDocumentIds?.length"
      @distribute-success="handleProcessAfterDistribute"
    />
  </AppModal>
</template>
