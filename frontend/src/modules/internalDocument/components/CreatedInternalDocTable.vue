<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import DestinationTableCell from '@/shared/components/outDoc/DestinationTableCell.vue'
import DocumentStatus from '@/shared/components/outDoc/DocumentStatus.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import type { TCommonOutdocFilter } from '@/shared/models/outDoc/document'
import type { ListDocumentVM } from '@/shared/services/api'
import { formatDateForOutDocTable } from '@/shared/utils/outDoc/common'
import type { ColumnProps, DataTableRowClickEvent } from 'primevue'
import { computed, useTemplateRef, watchEffect } from 'vue'
import { useGetCreatedInternalDocList } from '../composables/queries/useGetCreatedInternalDocList'
import ModalDetailInternalDoc from './modals/ModalDetailInternalDoc.vue'

type TModalDetailInternalDocRef = InstanceType<typeof ModalDetailInternalDoc>

const props = defineProps<{
  filterParams: TCommonOutdocFilter
}>()

const modalDetailInternalDocRef = useTemplateRef<TModalDetailInternalDocRef>(
  'modalDetailInternalDocRef'
)

const memoParams = computed(() => ({
  ...props.filterParams
}))

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true,
  otherMemoParams: memoParams
})

const { data, isLoading, refetch } = useGetCreatedInternalDocList(() => ({
  ...props.filterParams,
  urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value),
  documentTypes: props.filterParams.documentTypes?.map((option) => option.value),
  page: tablePagination.value.current,
  pageSize: tablePagination.value.pageSize
}))

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  // {
  //   field: 'type',
  //   customSlot: 'typeSlot'
  // },
  {
    field: (data) => data?.documentCode || '--',
    header: 'Số ký hiệu'
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
    field: 'destination',
    customSlot: 'destination',
    header: 'Nơi nhận'
  },
  {
    field: (data) => (data?.createdAt ? formatDateForOutDocTable(data?.createdAt) : '--'),
    header: 'Ngày tạo'
  },
  {
    field: 'status',
    header: 'Trạng thái',
    customSlot: 'status'
  }
]

const handleRowClick = (doc: ListDocumentVM) => {
  modalDetailInternalDocRef?.value?.openModal(doc?.id)
}

watchEffect(() => {
  console.log(data?.value, 'ádfadsffdsafsdafdsafsda')
})
</script>
<template>
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
    @row-click="(event: DataTableRowClickEvent<ListDocumentVM>) => handleRowClick(event.data)"
  >
    <!-- <template #typeSlot="{ data }">
      <DocumentTypeIcon :document="data" />
    </template> -->
    <template #subjectSlot="{ data }">
      <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
    </template>
    <template #destination="{ data }">
      <DestinationTableCell :document="data" />
    </template>
    <template #status="{ data }">
      <DocumentStatus :documentStatus="data?.status" />
    </template>
  </AppTable>
  <ModalDetailInternalDoc ref="modalDetailInternalDocRef" @processed-doc="refetch" />
</template>
