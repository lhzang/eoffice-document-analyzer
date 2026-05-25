<script setup lang="ts">
import PdfPreviewModal from '@/modules/esign/components/PdfPreviewModal.vue'
import RefreshButton from '@/modules/esign/components/RefreshButton.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { ref } from 'vue'
import { useSignedDocs } from '../composables/esign-history/useGetSignedHistory'

const pdfPreviewRef = ref<InstanceType<typeof PdfPreviewModal> | null>(null)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true
})

const { data, isLoading, refetch } = useSignedDocs(() => ({
  page: tablePagination.value.current + 1,
  pageSize: tablePagination.value.pageSize
}))

async function handlePreview(fileUrl: string, name: string) {
  pdfPreviewRef.value?.openPreview(fileUrl, name)
}

const columns = [
  { field: 'idx', header: 'STT', customSlot: 'indexCustom' },
  { field: 'signTime', header: 'Thời gian ký' },
  {
    field: 'creator',
    header: 'Người tạo giao dịch',
    style: {
      maxWidth: '300px'
    }
  },
  {
    field: 'account',
    header: 'Tài khoản ký số',
    customSlot: 'accountSlot',
    style: {
      maxWidth: '300px'
    }
  },
  { field: 'status', header: 'Trạng thái', customSlot: 'statusSlot' },
  {
    field: 'fileName',
    header: 'Tên file',
    customSlot: 'fileNameSlot',
    style: {
      maxWidth: '300px'
    }
  },
  { field: 'originalFile', header: 'File gốc', customSlot: 'originalFileSlot' },
  { field: 'signedFile', header: 'File đã ký', customSlot: 'signedFileSlot' }
]
</script>

<template>
  <div class="realative h-full w-full">
    <div class="flex h-full min-h-[100vh] flex-col">
      <div class="mb-6 flex items-center justify-end">
        <RefreshButton @refresh="refetch" :loading="isLoading" />
      </div>
      <AppTable
        :columns="columns"
        :data="data?.docs || []"
        :loading="isLoading"
        :empty="data?.docs.length === 0"
        paginator
        :lazy="true"
        :always-show-paginator="true"
        :totalRecords="data?.docCount"
        :rows="tablePagination.pageSize"
        :rowsPerPageOptions="tablePagination.pageSizeOptions"
        :first="tablePagination.current * tablePagination.pageSize"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
        @update:rows="updatePageSize"
      >
        <template #indexCustom="{ index }">
          <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
        </template>
        <template #statusSlot="{ data }">
          <div
            :class="[
              data.status === 'Ký thành công'
                ? 'rounded border border-green-200 bg-green-50 px-2 py-1 text-green-600'
                : 'rounded border border-red-200 bg-red-50 px-2 py-1 text-red-600'
            ]"
          >
            {{ data.status }}
          </div>
        </template>
        <template #fileNameSlot="{ data }">
          <span
            v-tippy="data.fileName"
            class="inline-block max-w-[220px] overflow-hidden text-ellipsis"
          >
            {{ data.fileName.length > 30 ? data.fileName.slice(0, 30) + '...' : data.fileName }}
          </span>
        </template>
        <template #accountSlot="{ data }">
          <span
            v-tippy="data.account"
            class="inline-block max-w-[220px] overflow-hidden text-ellipsis"
          >
            {{ data.account.length > 20 ? data.account.slice(0, 20) + '...' : data.account }}
          </span>
        </template>
        <template #originalFileSlot="{ data }">
          <span
            class="flex cursor-pointer justify-center text-blue-500 hover:text-blue-700"
            title="Xem file"
            @click="handlePreview(data.originalFile, data.fileName)"
          >
            <i class="pi pi-eye text-xl"></i>
          </span>
        </template>
        <template #signedFileSlot="{ data }">
          <span
            class="flex cursor-pointer justify-center text-blue-500 hover:text-blue-700"
            title="Xem file"
            @click="handlePreview(data.signedFile, data.fileName)"
          >
            <i class="pi pi-eye text-xl"></i>
          </span>
        </template>
      </AppTable>
    </div>

    <PdfPreviewModal ref="pdfPreviewRef" />
  </div>
</template>
