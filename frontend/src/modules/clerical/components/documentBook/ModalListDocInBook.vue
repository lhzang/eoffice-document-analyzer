<script setup lang="ts">
import ModalDetailInDoc from '@/modules/indoc/components/ModalDetailInDoc.vue'
import PriorityLevelComponent from '@/modules/indoc/components/PriorityLevelComponent.vue'
import { InComingDocumentConfig } from '@/modules/indoc/constants'
import ModalDetailInternalDoc from '@/modules/internalDocument/components/modals/ModalDetailInternalDoc.vue'
import ModalDetailOutDoc from '@/modules/outDocument/components/modals/ModalDetailOutDoc.vue'
import AppFilterBarWithSearch from '@/shared/components/AppFilterBarWithSearch.vue'
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import DocumentStatus from '@/shared/components/outDoc/DocumentStatus.vue'
import { usePagination } from '@/shared/composables/usePagination'
import { APP_DOCUMENT_TYPES } from '@/shared/constants/document'
import type { TUrgencyLevelValue } from '@/shared/models/document'
import type {
  DocumentByDocumentBookVM,
  ListDocumentBooksVM,
  ListDocumentVMStatusEnum
} from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { useDebounceFn } from '@vueuse/core'
import { Tag, type DataTableRowClickEvent } from 'primevue'
import { ref, useTemplateRef, watch } from 'vue'
import { useGetListDocInBook } from '../../composables/documentBook/queries/useGetListDocInBook'

type TModalDetailOutDocRef = InstanceType<typeof ModalDetailOutDoc>
type TModalDetailInternalDocRef = InstanceType<typeof ModalDetailInternalDoc>
type TModalDetailInDocRef = InstanceType<typeof ModalDetailInDoc>

const isVisible = ref(false)
const searchValue = ref<string>('')
const debouncedSearchValue = ref<string>('')
const documentBook = ref<ListDocumentBooksVM>()

const modalDetailOutDocRef = useTemplateRef<TModalDetailOutDocRef>('modalDetailOutDocRef')
const modalDetailInternalDocRef = useTemplateRef<TModalDetailInternalDocRef>(
  'modalDetailInternalDocRef'
)
const modalDetailInDocRef = useTemplateRef<TModalDetailInDocRef>('modalDetailInDocRef')

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  isMemorizedPage: true,
  pageSize: 50
})

const columns = [
  {
    header: 'Số văn bản',
    field: 'ordinal'
  },
  {
    header: 'Số ký hiệu',
    field: 'code'
  },
  {
    header: 'Trích yếu',
    field: 'subject',
    customSlot: 'subjectSlot'
  },
  {
    header: 'Ngày đến',
    field: 'docDate'
  },
  {
    header: 'Độ khẩn',
    field: 'priority',
    customSlot: 'prioritySlot',
    align: 'center'
  },
  {
    header: 'Trạng thái',
    field: 'status',
    customSlot: 'statusSlot'
  }
]

const { data, isLoading, refetch } = useGetListDocInBook(
  () => documentBook.value?.id!,
  () =>
    cleanObject({
      size: tablePagination.value.pageSize,
      page: tablePagination.value.current,
      search: debouncedSearchValue.value,
      sort: []
    })
  // { enabled: isVisible.value }
)

const debouncedFn = useDebounceFn((newVal) => {
  debouncedSearchValue.value = newVal
}, 500)

const handleSearch = (val: string) => {
  searchValue.value = val
}

const reset = () => {}

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    reset()
  }
}

const handleRowClick = (event: DataTableRowClickEvent<DocumentByDocumentBookVM>) => {
  const docId = event?.data?.documentId
  switch (documentBook?.value?.type) {
    case APP_DOCUMENT_TYPES.inDoc:
      modalDetailInDocRef.value?.openModal(docId)
      break
    case APP_DOCUMENT_TYPES.internalDoc:
      modalDetailInternalDocRef.value?.openModal(docId)
      break
    case APP_DOCUMENT_TYPES.outDoc:
      modalDetailOutDocRef.value?.openModal(docId)
  }
}

defineExpose({
  openModal: (selectedBook: ListDocumentBooksVM) => {
    documentBook.value = selectedBook
    isVisible.value = true
  },
  closeModal: () => (isVisible.value = false)
})

watch(searchValue, (newValue) => {
  debouncedFn(newValue)
})
</script>

<template>
  <AppModal
    v-model:visible="isVisible"
    :wrapper-style="{ width: '99%', maxHeight: '98%', overflow: 'hidden' }"
    :classContent="'!overflow-auto pt-0! p-2! lg:p-4! lg:pt-0! h-full  flex flex-col'"
    @update:visible="onVisibleChange"
    title="Danh sách văn bản lưu trong sổ"
  >
    <AppFilterBarWithSearch
      class="flex items-center justify-end gap-2"
      placeholder="Tìm kiếm theo tên sổ văn bản"
      :search-string="searchValue"
      @search="handleSearch"
    />
    <AppTable
      class="mt-10"
      :data="data?.items ?? []"
      :columns="columns"
      :loading="isLoading"
      paginator
      :always-show-paginator="true"
      :totalRecords="data?.totalItems"
      :lazy="true"
      :rows="tablePagination.pageSize"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      :first="tablePagination.current * tablePagination.pageSize"
      @update:rows="updatePageSize"
      @row-click="handleRowClick"
      scrollable
    >
      <template #subjectSlot="{ data }">
        <DocumentSubject
          :subject="data.subject"
          :urgentLevel="data.priority as TUrgencyLevelValue"
        />
      </template>
      <template #prioritySlot="{ data }">
        <PriorityLevelComponent
          :priority="data.priority as TUrgencyLevelValue"
          :exclude-priorities="[]"
        />
      </template>
      <template #statusSlot="{ data }">
        <Tag
          v-if="data?.status && documentBook?.type === APP_DOCUMENT_TYPES?.inDoc"
          :value="InComingDocumentConfig?.[data?.status]?.title"
          class="text-center font-semibold!"
        />
        <DocumentStatus
          v-else-if="data?.status && documentBook?.type !== APP_DOCUMENT_TYPES?.inDoc"
          :documentStatus="data?.status as ListDocumentVMStatusEnum"
        />
      </template>
    </AppTable>
    <ModalDetailInDoc
      v-if="documentBook?.type === APP_DOCUMENT_TYPES?.inDoc"
      ref="modalDetailInDocRef"
      :is-view-by-o-m="false"
      @docProcessed="refetch"
    />
    <ModalDetailOutDoc
      v-if="documentBook?.type === APP_DOCUMENT_TYPES?.outDoc"
      ref="modalDetailOutDocRef"
      @processed-doc="refetch"
    />
    <ModalDetailInternalDoc
      v-if="documentBook?.type === APP_DOCUMENT_TYPES?.internalDoc"
      ref="modalDetailInternalDocRef"
      @processed-doc="refetch"
    />
  </AppModal>
</template>
