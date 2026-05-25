<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import DestinationTableCell from '@/shared/components/outDoc/DestinationTableCell.vue'
import DocumentStatus from '@/shared/components/outDoc/DocumentStatus.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import type { TCommonOutdocFilter } from '@/shared/models/outDoc/document'
import { OUT_DOC_ISSUED_STATUS_VALUES } from '@/shared/models/outDoc/document'
import type { ListDocumentVM } from '@/shared/services/api'
import { formatDateForOutDocTable } from '@/shared/utils/outDoc/common'
import { DateTime } from 'luxon'
import type { ColumnProps, DataTableRowClickEvent } from 'primevue'
import { computed, ref } from 'vue'
import { useGetIssueODList } from '../composables/queries/useGetIssueODList'
import DocumentTypeIcon from './DocumentTypeIcon.vue'
import ModalDetailOutDoc from './modals/ModalDetailOutDoc.vue'

type TModalDetailOutDocRef = InstanceType<typeof ModalDetailOutDoc>

const props = defineProps<{
  filterParams: TCommonOutdocFilter
}>()

const modalDetailOutDocRef = ref<TModalDetailOutDocRef | null>(null)

const memoParams = computed(() => ({
  ...props.filterParams,
  tab: OUT_DOC_ISSUED_STATUS_VALUES.numbered
}))

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true,
  otherMemoParams: memoParams
})

const { data, isLoading, refetch } = useGetIssueODList(
  () => ({
    ...props.filterParams,
    urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value),
    documentTypes: props.filterParams.documentTypes?.map((option) => option.value),
    page: tablePagination.value.current,
    pageSize: tablePagination.value.pageSize
  }),
  () => OUT_DOC_ISSUED_STATUS_VALUES.numbered
)

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    field: 'type',
    customSlot: 'typeSlot'
  },
  {
    field: 'documentCode',
    header: 'Số ký hiệu'
  },
  {
    field: (data) => data?.creatorUnit?.name,
    header: 'Đơn vị trình'
  },
  {
    field: 'majorSigner',
    customSlot: 'majorSignerSlot',
    header: 'Lãnh đạo ký'
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
    header: 'Ngày cấp số'
  },
  {
    field: 'destination',
    customSlot: 'destination',
    header: 'Nơi nhận'
  },
  {
    field: 'status',
    header: 'Trạng thái',
    customSlot: 'status'
  }
]

const handleRowClick = (doc: ListDocumentVM) => {
  modalDetailOutDocRef?.value?.openModal(doc?.id)
}
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
    <template #typeSlot="{ data }">
      <DocumentTypeIcon :document="data" />
    </template>
    <template #majorSignerSlot="{ data }">
      <div>{{ data?.majorSignerLeader?.name }}</div>
      <div v-if="data?.majorSignerSignedTime">
        [{{ DateTime.fromISO(data?.majorSignerSignedTime).toFormat('dd/MM/yyyy HH:mm') }}]
      </div>
    </template>
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
  <ModalDetailOutDoc ref="modalDetailOutDocRef" @processed-doc="refetch" />
</template>
