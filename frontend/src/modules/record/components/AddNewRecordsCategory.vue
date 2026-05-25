<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { ref, useTemplateRef } from 'vue'
import UploadForm from './AddNewRecordsUpload.vue'
import ManualForm from './AddRecordsFormManual.vue'

type ModalType = InstanceType<typeof AppModal>

const activeTab = ref<'manual' | 'upload'>('manual')
const modalRef = useTemplateRef<ModalType | null>('modalRef')

const closeModal = () => {
  modalRef.value?.closeModal()
}

defineExpose({
  openModal: () => {
    activeTab.value = 'manual'
    modalRef.value?.openModal()
  },
  closeModal
})
</script>

<template>
  <AppModal
    ref="modalRef"
    title="Thêm mới đề mục hồ sơ công việc"
    :wrapper-style="{ width: '60%', height: 'auto', maxHeight: '98%', overflow: 'hidden' }"
  >
    <!-- Tabs -->
    <div class="mb-6 flex rounded-lg border bg-gray-50">
      <button
        type="button"
        class="flex-1 rounded-md px-4 py-2 text-sm font-medium"
        :class="activeTab === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-600'"
        @click="activeTab = 'manual'"
      >
        Thêm thủ công
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-4 py-2 text-sm font-medium"
        :class="activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600'"
        @click="activeTab = 'upload'"
      >
        Tải lên từ máy
      </button>
    </div>

    <ManualForm v-if="activeTab === 'manual'" @success="closeModal" />

    <UploadForm v-else @success="closeModal" />
  </AppModal>
</template>
