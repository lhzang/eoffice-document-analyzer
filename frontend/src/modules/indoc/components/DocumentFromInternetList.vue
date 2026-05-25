<script setup lang="ts">
import { DateTime } from 'luxon'
import { Tag, type ColumnProps, type DataTableRowClickEvent } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'

import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { useGetPendingReceiveInDoc } from '../composables/queries/useGetPendingReceiveInDoc'

import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import type { InDocDocumentVM } from '@/shared/services/api'
import { useRoute } from 'vue-router'
import { InComingDocumentConfig } from '../constants'
import type { TCommonIndocFilter, TDocumentFromInternetTabs } from '../models/types'
type TModalRef = InstanceType<typeof ModalDetailInDoc>
const route = useRoute()
const sortString = ref<string | undefined>(route.query?.sort as string | undefined)

const modalRef = useTemplateRef<TModalRef>('modalRef')

const props = defineProps<{
  activeTab: TDocumentFromInternetTabs
  filterParams: TCommonIndocFilter
}>()

const memoParams = computed(() => ({
  ...props.filterParams,
  tab: props.activeTab,
  sort: sortString.value
  // order: getStringSortOrderValue(sortOrder.value)
}))
const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true,
  otherMemoParams: memoParams
})

const {
  data: indocList,
  isLoading,
  refetch
} = useGetPendingReceiveInDoc(
  () => props.activeTab,
  () => ({
    ...props.filterParams,
    urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value),
    documentTypes: props.filterParams.documentTypes?.map((option) => option.value),
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: sortString.value ? [sortString.value] : []
  })
)
const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: InDocDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    field: 'idx',
    header: 'STT',
    customSlot: 'indexCustom'
  },

  {
    field: 'documentCode',
    header: 'Số ký hiệu'
  },

  {
    field: 'shortDescription',
    header: 'Trích yếu nội dung',
    customSlot: 'shortDescriptionSlot',
    style: {
      width: '400px'
    },
    bodyClass: 'break-words'
  },
  {
    field: (item) =>
      item.arrivalDate ? DateTime.fromISO(item.arrivalDate).toFormat('dd/MM/yyyy') : '',
    header: 'Ngày đến'
  },
  {
    field: (item) => (item.dueDate ? DateTime.fromISO(item.dueDate).toFormat('dd/MM/yyyy') : ''),
    header: 'Hạn trả lời'
  },
  {
    field: 'issuedUnit',
    header: 'Nơi gửi',
    style: {
      maxWidth: '150px'
    }
  },
  {
    field: 'status',
    header: 'Trạng thái',
    customSlot: 'statusSlot',
    style: {
      minWidth: '100px',
      width: '150px'
    }
  }
]

const handleRowClick = (data: InDocDocumentVM) => {
  modalRef.value?.openModal(data?.documentId)
}
</script>

<template>
  <div>
    <AppTable
      :loading="isLoading"
      :empty="!isLoading && indocList?.docs.length === 0"
      :columns="columns"
      :data="indocList?.docs ?? []"
      paginator
      :always-show-paginator="true"
      :totalRecords="indocList?.docCount"
      :lazy="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      :first="tablePagination.current * tablePagination.pageSize"
      @update:rows="updatePageSize"
      @row-click="(event: DataTableRowClickEvent<any>) => handleRowClick(event.data)"
    >
      <template #indexCustom="{ index }">
        <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
      </template>
      <template #shortDescriptionSlot="{ data }">
        <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
      </template>
      <template #statusSlot="{ data }">
        <Tag
          v-if="data.documentStatus"
          :value="InComingDocumentConfig?.[data?.documentStatus]?.title"
          class="text-center font-semibold!"
        />
      </template>
    </AppTable>
    <ModalDetailInDoc ref="modalRef" :is-view-by-o-m="false" @doc-processed="refetch" />
  </div>
</template>

<style scoped></style>
