<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import OutDocumentFilter from '@/shared/components/outDoc/OutDocumentFilter.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { TCommonOutdocFilter } from '@/shared/models/outDoc/document'
import type { ListDocumentVM } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { formatDateForOutDocTable } from '@/shared/utils/outDoc/common'
import { Message, type ColumnProps } from 'primevue'
import { ref } from 'vue'
import { useGetCreatedODList } from '../composables/queries/useGetCreatedODList'

type TProps = {
  errorMessage?: string
}

const { errorMessage } = defineProps<TProps>()

const emit = defineEmits<{
  (e: 'documentSelect', id: string): void
}>()

const filterParams = ref<TCommonOutdocFilter>({})
const handleFilter = (data: TCommonOutdocFilter | null) => {
  filterParams.value = data ? cleanObject(data) : {}
}
const selectedDoc = ref<ListDocumentVM>()

const { tablePagination, updateCurrentPage } = usePagination({
  pageSize: 5,
  isMemorizedPage: false,
  otherMemoParams: filterParams
})

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    field: 'documentType',
    header: 'Loại văn bản'
  },
  {
    field: (data) => data?.documentCode,
    header: 'Số văn bản'
  },
  {
    field: 'subject',
    customSlot: 'subjectSlot',
    header: 'Trích yếu nội dung',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    field: (data) => (data?.issuedDate ? formatDateForOutDocTable(data?.issuedDate) : '--'),
    header: 'Ngày tạo'
  }
]

const { data: listCreatedDocs, isLoading: isGettingListCreatedDocs } = useGetCreatedODList(() => ({
  ...filterParams.value,
  isIssued: true,
  urgentLevels: filterParams.value.urgentLevels?.map((option) => option.value),
  documentTypes: filterParams.value.documentTypes?.map((option) => option.value),
  page: tablePagination.value.current,
  pageSize: tablePagination.value.pageSize
}))
</script>
<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <OutDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <div class="mt-8">
      <AppTable
        :loading="isGettingListCreatedDocs"
        :empty="!isGettingListCreatedDocs && listCreatedDocs?.items.length === 0"
        :columns="columns"
        :data="listCreatedDocs?.items ?? []"
        paginator
        :always-show-paginator="false"
        :totalRecords="listCreatedDocs?.totalItems"
        :lazy="true"
        selectionMode="single"
        @row-select="(event) => emit('documentSelect', event?.data?.id)"
        v-model:selection="selectedDoc"
        :rows="tablePagination.pageSize"
        :first="tablePagination.current * tablePagination.pageSize"
        @page="({ page, rows }) => updateCurrentPage(page, rows)"
      >
        <template #subjectSlot="{ data }">
          <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
        </template>
      </AppTable>
      <Message v-if="!!errorMessage" severity="error" size="small" variant="simple">
        {{ errorMessage }}
      </Message>
    </div>
  </div>
</template>
