<script setup lang="ts">
import AppNumberInput from '@/shared/components/form-elements/AppNumberInput.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import AppTextInput from '@/shared/components/form-elements/AppTextInput.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import { Button } from 'primevue'
import { ref, useTemplateRef } from 'vue'

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
    title="Thêm mới hồ sơ công việc"
    :wrapper-style="{ width: '60%', height: 'auto', maxHeight: '98%', overflow: 'hidden' }"
  >
    <form class="grid grid-cols-1 gap-6 p-4" @submit.prevent="onSubmit">
      <AppTextInput name="title" label="Tên hồ sơ *" />

      <AppSelect
        name="recordCategory"
        label="Đề mục hồ sơ *"
        :fetch-options="fetchRecordCategories"
      />
      <div class="grid grid-cols-2 gap-4">
        <AppTextInput name="" label="Thời gian bảo quản"></AppTextInput>
        <AppTextInput name="" label="Nơi bảo quản"></AppTextInput>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          name="unitLeaders"
          label="Lãnh đạo đơn vị duyệt hồ sơ"
          multiple
          :fetch-options="fetchUsers"
        />
        <AppSelect
          name="archivists"
          label="Lưu trữ Đại học phụ trách"
          multiple
          :fetch-options="fetchUsers"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          name="categoryLeaders"
          label="Lưu trữ đơn vị phụ trách"
          multiple
          :fetch-options="fetchUsers"
        />
        <AppTextInput name="" label="Ghi chú"></AppTextInput>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <AppTextInput name="language" label="Ngôn ngữ"></AppTextInput>
        <AppNumberInput name="totalPageNumber" type="number" label="Tổng số trang *" />
        <AppTextInput name="keyword" label="Từ khóa"></AppTextInput>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <Button type="submit" variant="contained" :loading="isSubmitting" :disabled="disableSubmit">
          Lưu
        </Button>
      </div>
    </form>
  </AppModal>
</template>
