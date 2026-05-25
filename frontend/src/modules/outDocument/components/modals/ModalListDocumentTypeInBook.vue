<script setup lang="ts">
import AppModal from '@/shared/components/modals/AppModal.vue'
import { useGetDetailDocumentBook } from '@/shared/composables/queries/clerical/useGetDetailDocumentBook'
import { ref } from 'vue'

const visible = ref(false)
const bookId = ref<string | null>(null)

const {
  data: detailDocumentBook,
  isLoading: isGettingDetailData,
  error,
  isError
} = useGetDetailDocumentBook(() => bookId.value!, {
  enabled: () => !!bookId?.value
})

const reset = () => {
  bookId.value = null
}

const handleVisibleChange = (isVisible: boolean) => {
  if (!isVisible) reset()
}

defineExpose({
  openModal: (id: string) => {
    bookId.value = id
    visible.value = true
  },
  closeModal: () => (visible.value = false)
})
</script>
<template>
  <AppModal
    title="Danh sách loại văn bản"
    v-model:visible="visible"
    @update:visible="handleVisibleChange"
    :is-loading="isGettingDetailData"
    :wrapper-style="{ width: '540px', maxHeight: '400px', overflow: 'auto' }"
  >
    <div v-if="isError && error" class="flex h-[200px] items-center justify-center">
      {{ error?.detail ?? error?.message ?? 'Đã có lỗi xảy ra' }}
    </div>
    <div v-else class="grid grid-cols-2 gap-x-6 gap-y-2">
      <span
        class="font-semibold"
        v-for="(type, idx) in detailDocumentBook?.documentTypeVMList"
        :key="idx"
        >{{ type?.name }}</span
      >
    </div>
  </AppModal>
</template>
