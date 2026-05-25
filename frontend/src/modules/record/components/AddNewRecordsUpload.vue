<script setup lang="ts">
import { usePreviewRecordCategory } from '@/modules/record/composables/usePreviewRecordCategory'
import AppTable from '@/shared/components/AppTable.vue'
import { useToast } from 'primevue'
import { computed, ref } from 'vue'
import { useCreateRecordCategoryByFileUpload } from '../composables/useCreateRecordCategoryByFileUpload'

const file = ref<File | null>(null)
const previewData = ref<any[]>([])
const errorMessage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const { mutateAsync, isPending } = usePreviewRecordCategory()
const emit = defineEmits<{
  (e: 'success'): void
}>()
const columns = [
  { header: 'STT', field: 'excelOrdinal' },
  { header: 'Tên đề mục', field: 'name' },
  { header: 'Tên đề mục lớn', field: 'parentName' },
  { header: 'Số & ký hiệu', field: 'code' },
  { header: 'Đơn vị', field: 'unit' },
  { header: 'Cấp lưu trữ', field: 'archiveLevel' },
  { header: 'Thời hạn', field: 'expirationInfo.duration' }
]

const toast = useToast()

const { mutateAsync: submitFile, isPending: isSubmitting } = useCreateRecordCategoryByFileUpload()

const isAllValid = computed(
  () => previewData.value.length > 0 && previewData.value.every((item) => item.valid === true)
)

const handleSubmit = async () => {
  if (!file.value) return

  try {
    await submitFile(file.value)
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tạo đề mục hồ sơ thành công',
      life: 3000
    })

    // reset sau khi submit
    removeFile()
    emit('success')
  } catch (err) {
    console.log('err: ', err)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tạo đề mục từ file',
      life: 3000
    })
  }
}
const handleFileChange = async (event: Event) => {
  errorMessage.value = null
  previewData.value = []

  const input = event.target as HTMLInputElement
  const selectedFile = input.files?.[0]
  if (!selectedFile) return

  file.value = selectedFile

  try {
    // ✅ GỌI ĐÚNG COMPOSABLE
    const data = await mutateAsync(selectedFile)

    previewData.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.log('e: ', e)
    errorMessage.value = 'Không thể preview file'
  }
}

const removeFile = () => {
  file.value = null
  previewData.value = []
  errorMessage.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <!-- Upload -->
    <div class="rounded-lg border-2 border-dashed p-6 text-center">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".xlsx,.csv"
        @change="handleFileChange"
      />

      <label
        v-if="!file"
        class="cursor-pointer text-blue-600 underline"
        @click="fileInputRef?.click()"
      >
        Chọn file Excel
      </label>

      <div v-else>
        <p class="font-medium">{{ file.name }}</p>
        <button class="text-sm text-red-500 underline" @click="removeFile">Xoá file</button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-500">
      {{ errorMessage }}
    </p>

    <!-- Preview table -->
    <AppTable
      v-if="previewData.length"
      :data="previewData"
      :columns="columns"
      :loading="isPending"
    />
    <div class="flex justify-end" v-if="isAllValid">
      <button
        class="rounded bg-blue-600 px-4 py-2 text-white"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Đang tạo...' : 'Tạo đề mục hồ sơ' }}
      </button>
    </div>
  </div>
</template>
