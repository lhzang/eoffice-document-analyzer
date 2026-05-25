<script setup lang="ts">
import { DateTime } from 'luxon'
import { type ColumnProps, type DataTableRowClickEvent } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'

import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'

import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import type { InDocDocumentVM } from '@/shared/services/api'
import { useRoute } from 'vue-router'
import { Tippy } from 'vue-tippy'
import { useGetToCreatedInDoc } from '../composables/queries/useGetToCreatedInDoc'
import type { TDocumentInDoc } from '../mocks/dataIDWaitForReview'
import type { TCommonIndocFilter } from '../models/types'
import DocumentSourceIcon from './DocumentSourceIcon.vue'

type TModalRef = InstanceType<typeof ModalDetailInDoc>
const route = useRoute()

const props = defineProps<{
  filterParams: TCommonIndocFilter
}>()
const sortString = ref<string | undefined>(route.query?.sort as string | undefined)

const memoParams = computed(() => ({
  ...props.filterParams,
  sort: sortString.value
  // order: getStringSortOrderValue(sortOrder.value)
}))

const modalRef = useTemplateRef<TModalRef>('modalRef')
const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: true,
  otherMemoParams: memoParams
})

// const { data, isLoading } = useGetToCreatedInDoc({
//   page: tablePagination.value.current,
//   size: tablePagination.value.pageSize,
//   urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value)
// })
const { data, isLoading, refetch } = useGetToCreatedInDoc(() => ({
  ...props.filterParams,
  urgentLevels: props.filterParams.urgentLevels?.map((option) => option.value),
  documentTypes: props.filterParams.documentTypes?.map((option) => option.value),
  page: tablePagination.value.current,
  size: tablePagination.value.pageSize,
  sort: sortString.value ? [sortString.value] : []
}))
const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: InDocDocumentVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  // {
  //   field: 'sourceDocument',
  //   header: '',
  //   customSlot: 'sourceDocumentSlot',
  //   style: {
  //     minWidth: '24px',
  //     width: 'fit-content'
  //   }
  // },
  // {
  //   field: 'idx',
  //   header: 'STT',
  //   customSlot: 'indexCustom'
  // },
  {
    field: 'icon',
    customSlot: 'documentIconCustom',
    style: { width: '40px' }
  },
  {
    field: 'inOrdinal',
    header: 'Số đến'
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
    header: 'Ngày nhận'
  },
  {
    field: (item) => (item.dueDate ? DateTime.fromISO(item.dueDate).toFormat('dd/MM/yyyy') : ''),
    header: 'Hạn trả lời'
  },
  {
    field: 'issuedUnit',
    header: 'Nơi gửi',
    style: {
      width: '150px',
      minWidth: '150px'
    },
    bodyClass: 'break-words'
  }
]

const handleRowClick = (data: TDocumentInDoc) => {
  modalRef.value?.openModal(data?.documentId)
}
</script>

<template>
  <div>
    <AppTable
      :loading="isLoading"
      :empty="!isLoading && data?.docs.length === 0"
      :columns="columns"
      :data="data?.docs ?? []"
      paginator
      :always-show-paginator="true"
      :totalRecords="data?.docCount"
      :lazy="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      :first="tablePagination.current * tablePagination.pageSize"
      @update:rows="updatePageSize"
      @row-click="(event: DataTableRowClickEvent<InDocDocumentVM>) => handleRowClick(event.data)"
    >
      <!-- <template #indexCustom="{ index }">
        <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
      </template> -->
      <template #documentIconCustom="{ data }">
        <DocumentSourceIcon :document="data" />
      </template>
      <template #shortDescriptionSlot="{ data }">
        <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
      </template>
      <template #sourceDocumentSlot>
        <div class="flex w-[fit-content]">
          <Tippy content="Văn bản có file đính kèm">
            <span class="icon-[icon-park-outline--link] text-primary text-2xl"></span>
          </Tippy>
        </div>
      </template>
    </AppTable>
    <ModalDetailInDoc ref="modalRef" :is-view-by-o-m="false" @doc-processed="refetch" />
  </div>
</template>
