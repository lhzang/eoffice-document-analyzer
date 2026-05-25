<script setup lang="ts">
import AppSearch from '@/shared/components/AppSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import AppDateInput from '@/shared/components/form-elements/AppDateInput.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { OUT_DOC_ISSUED_STATUS_VALUES } from '@/shared/models/outDoc/document'
import type { ListDocumentVM } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { formatDateForOutDocTable } from '@/shared/utils/outDoc/common'
import type { ColumnProps } from 'primevue'
import { computed, ref } from 'vue'
import { useGetIssueODList } from '../composables/queries/useGetIssueODList'

const search = ref<string>('')
const date = ref()

const emit = defineEmits<{
  (e: 'documentSelect', document: ListDocumentVM): void
}>()

const selectedDoc = ref<ListDocumentVM>()
const filterParams = computed(() =>
  cleanObject({
    search: search?.value,
    startDate: date?.value
  })
)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: 5,
  otherMemoParams: filterParams
})

const { data, isLoading } = useGetIssueODList(
  () =>
    cleanObject({
      pageSize: tablePagination.value.pageSize,
      page: tablePagination.value.current,
      search: search?.value?.trim() ? search?.value?.trim() : undefined
    }),
  () => OUT_DOC_ISSUED_STATUS_VALUES.numbered
)

const handleSearch = (searchString: string) => {
  search.value = searchString
}

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'Số ký hiệu',
    field: 'documentCode'
  },
  {
    header: 'Trích yếu nội dung',
    field: 'subject',
    customSlot: 'subjectSlot',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    header: 'Người soạn thảo',
    field: (data) => data?.creator?.name
  },
  {
    header: 'Ngày ban hành',
    field: (data) => (data?.issuedDate ? formatDateForOutDocTable(data?.issuedDate) : '--')
  }
]
</script>
<template>
  <div>
    <div class="mb-6 grid grid-cols-5 gap-4">
      <AppDateInput
        class="col-span-2"
        name="date"
        :model-value="date"
        placeholder="Chọn hạn dự kiến"
        date-format="yy"
        view="year"
        :append-to="'body'"
        auto-z-index
      />
      <AppSearch
        class="border-surface-300 col-span-3 inline-flex h-10 w-full items-center rounded-[var(--p-form-field-border-radius)]! border bg-white px-2 py-1"
        placeholder="Tìm kiếm văn bản"
        @search="handleSearch"
      />
    </div>
    <AppTable
      :loading="isLoading"
      :empty="!isLoading && data?.items.length === 0"
      :columns="columns"
      :data="data?.items ?? []"
      paginator
      :always-show-paginator="true"
      :totalRecords="data?.totalItems"
      :lazy="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      :first="tablePagination.current * tablePagination.pageSize"
      removableSort
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      @update:rows="updatePageSize"
      :selection-mode="'single'"
      v-model:selection="selectedDoc"
      @row-select="(event) => emit('documentSelect', event?.data)"
    >
      <template #subjectSlot="{ data }">
        <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
      </template>
    </AppTable>
  </div>
</template>
