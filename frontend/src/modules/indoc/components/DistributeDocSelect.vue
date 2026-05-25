<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import DocumentSubject from '@/shared/components/document/DocumentSubject.vue'
import AppSelect from '@/shared/components/form-elements/AppSelect.vue'
import { useGetAffectUnitBySelfPermission } from '@/shared/composables/queries/accessControl/useGetAffectUnitBySelfPermission'
import { usePagination } from '@/shared/composables/usePagination'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/common'
import { APP_PERMISSION_VALUES } from '@/shared/constants/permission'
import type { InDocDocumentVM } from '@/shared/services/api'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { cleanObject } from '@/shared/utils/common'
import { differenceBy, uniqBy } from 'lodash-es'
import { DateTime } from 'luxon'
import { Button, type ColumnProps, type DataTableSelectAllChangeEvent } from 'primevue'
import { computed, ref, watch } from 'vue'
import { useGetBulkDistributeableDocs } from '../composables/queries/useGetBulkDistributeableDocs'
import type { TCommonIndocFilter } from '../models/types'
import InDocumentFilter from './InDocumentFilter.vue'

const user = useUserProfileStore().user
const filterParams = ref<TCommonIndocFilter>({})
const selectedUnitId = defineModel<null | string>('selectedUnitId', { required: true })
const selectedDocuments = defineModel<InDocDocumentVM[]>('selectedDocuments', { required: true })

const emit = defineEmits<{
  (e: 'cancelDistribute'): void
  (e: 'nextStep'): void
}>()

// const sortField = ref<string>()
// const sortOrder = ref<number>(0)

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: DEFAULT_PAGE_SIZE,
  isMemorizedPage: false
})

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
    field: 'inOrdinal',
    header: 'Số đến'
  },
  {
    field: 'documentCode',
    header: 'Số ký hiệu'
  },
  {
    field: 'role',
    header: 'Vai trò'
    // sortable: true
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
    // field: 'arrivalDate',
    field: (item) =>
      item.arrivalDate ? DateTime.fromISO(item.arrivalDate).toFormat('dd/MM/yyyy') : '',
    header: 'Ngày đến',
    sortField: 'arrivalDate'
    // sortable: true
  },
  {
    field: (item) => (item?.dueDate ? DateTime.fromISO(item?.dueDate).toFormat('dd/MM/yyyy') : ''),
    header: 'Hạn trả lời'
  },
  {
    field: 'issueUnit.name',
    header: 'Nơi gửi',
    style: {
      maxWidth: '150px'
    }
  }
]

const { data, isLoading } = useGetBulkDistributeableDocs(
  () => ({
    ...filterParams.value,
    urgentLevels: filterParams.value.urgentLevels?.map((option) => option.value),
    documentTypes: filterParams.value.documentTypes?.map((option) => option.value),
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: []
  }),
  {
    enabled: () => !!selectedUnitId?.value,
    queryKey: ['get-wait-for-process-id-for-bulk-handle', selectedUnitId?.value]
  }
)

// const handleUpdateSortData = (e: DataTableSortEvent) => {
//   sortField.value = e.sortField as string
//   sortOrder.value = !!e.sortOrder ? e.sortOrder : 0
// }

const {
  data: hasRoleUnits,
  isLoading: isGetttingHasRoleUnits,
  isError
} = useGetAffectUnitBySelfPermission(() => APP_PERMISSION_VALUES.distributeIndoc)

const currentUnit = computed(() => {
  const foundUnit =
    hasRoleUnits?.value?.find((unit) => unit?.id === user?.currentPosition?.unitId) ??
    hasRoleUnits?.value?.[0]
  if (foundUnit)
    return {
      label: foundUnit?.name,
      value: foundUnit?.id
    }
  return undefined
})

const handleGetDistributeUnits = async () => {
  if (isError.value)
    return {
      options: [],
      hasMore: false
    }

  return {
    options: (hasRoleUnits?.value ?? [])?.map((unit) => ({
      label: unit?.name,
      value: unit?.id
    })),
    hasMore: false
  }
}

const handleFilter = (data: TCommonIndocFilter | null) => {
  filterParams.value = data ? cleanObject(data) : {}
}
// const handleResetFilter = () => {
//   filterParams.value = {}
// }
const handleSelectAllDocumentInPage = (e: DataTableSelectAllChangeEvent) => {
  if (e.checked) {
    selectedDocuments.value = uniqBy(
      [...selectedDocuments.value, ...(data?.value?.docs ?? [])],
      'documentId'
    )
  } else {
    selectedDocuments.value = differenceBy(
      selectedDocuments.value,
      data?.value?.docs ?? [],
      'documentId'
    )
  }
}

watch([() => filterParams], () => (selectedDocuments.value = []))
</script>
<template>
  <!-- <div class="justify-betwee4 mb-2 flex items-center">

    </div> -->
  <div class="card">
    <div class="mb-4 flex justify-between">
      <AppSelect
        class="w-[300px]"
        name="distributeUnit"
        isFetchOnInit
        :disabled="isGetttingHasRoleUnits"
        :multiple="false"
        :default-value="currentUnit"
        @select="
          (value) => {
            selectedUnitId = value.value
          }
        "
        :fetch-options="handleGetDistributeUnits"
      />
      <InDocumentFilter @submit="handleFilter" :filterValues="filterParams" />
    </div>
    <AppTable
      :loading="isLoading"
      :empty="!isLoading && data?.docs.length === 0"
      :columns="columns"
      :data="data?.docs ?? []"
      selection-mode="multiple"
      paginator
      :always-show-paginator="true"
      :totalRecords="data?.docCount"
      :lazy="true"
      :rows="tablePagination.pageSize"
      :rowsPerPageOptions="tablePagination.pageSizeOptions"
      :first="tablePagination.current * tablePagination.pageSize"
      removableSort
      v-model:selection="selectedDocuments"
      :select-all="
        data?.docs &&
        data?.docs?.every((doc) =>
          selectedDocuments?.some((selectedDoc) => selectedDoc?.documentId === doc?.documentId)
        )
      "
      @select-all-change="handleSelectAllDocumentInPage"
      @page="({ page, rows }) => updateCurrentPage(page, rows)"
      @update:rows="updatePageSize"
    >
      <template #header>
        <div class="flex h-4 items-center justify-end">
          <div class="text-lg font-semibold">
            {{ selectedDocuments?.length ? `Đã chọn ${selectedDocuments?.length} văn bản` : '' }}
          </div>
          <!-- <Button
              severity="primary"
              :disabled="!selectedDocuments?.length"
              label="Phân phối"
              v-tippy="'Phân phối văn bản đã chọn'"
              variant="outlined"
            >
              <template #icon>
                <span class="icon-[hugeicons--hierarchy-square-07] text-xl"></span>
              </template>
            </Button> -->
        </div>
      </template>
      <template #indexCustom="{ index }">
        <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
      </template>
      <template #shortDescriptionSlot="{ data }">
        <DocumentSubject :subject="data.subject" :urgentLevel="data.priority" />
      </template>
    </AppTable>
  </div>
  <div class="mt-2 flex h-10 items-center justify-end gap-2">
    <Button
      class="min-w-[100px]"
      label="Huỷ"
      severity="secondary"
      variant="outlined"
      @click="emit('cancelDistribute')"
    />
    <Button
      type="submit"
      class="min-w-[100px]"
      label="Tiếp theo"
      severity="primary"
      :disabled="!selectedDocuments?.length"
      @click="emit('nextStep')"
    />
  </div>
</template>
