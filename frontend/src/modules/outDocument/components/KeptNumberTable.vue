<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { useGetRegisterNumber } from '@/shared/composables/queries/clerical/useGetRegisterNumber'
import { usePagination } from '@/shared/composables/usePagination'
import type { ListRegisteredKeepNumberVM } from '@/shared/services/api'
import {
  cleanObject,
  getNumberSortOrderValue,
  getStringSortOrderValue
} from '@/shared/utils/common'
import { DateTime } from 'luxon'
import type { ColumnProps, DataTableSortEvent } from 'primevue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  NUMBER_REGISTER_STATUS_LABELS,
  NUMBER_REGISTER_STATUS_VALUES
} from '../constants/keepNumber'
import type { TRegistedNumberFilter } from '../models/keepNumber'

type TProps = {
  filterParams: TRegistedNumberFilter
}

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string | ((item: ListRegisteredKeepNumberVM) => string)
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  { field: 'idx', header: 'STT', customSlot: 'indexCustom' },
  { field: 'documentBookName', header: 'Sổ văn bản', sortable: true, sortField: 'db.name' },
  { field: 'keepNumber', header: 'Số giữ', sortable: true, sortField: 'kn.number' },
  {
    field: (item) =>
      item.registeredOn ? DateTime.fromISO(item.registeredOn).toFormat('dd/MM/yyyy') : '',
    header: 'Thời gian đăng ký',
    sortable: true,
    sortField: 'kn.registeredOn'
  },
  { field: 'reason', header: 'Lý do của việc đăng ký', sortable: true, sortField: 'kn.reason' },
  {
    field: (item) => (item?.title ? item?.title : '--'),
    header: 'Tiêu đề của văn bản sử dụng số giữ',
    sortable: true,
    sortField: 'kn.title'
  },
  {
    customSlot: 'statusSlot',
    field: 'status',
    header: 'Trạng thái',
    sortable: true,
    sortField: 'kn.status'
  }
]

const props = defineProps<TProps>()

const route = useRoute()

const sortString = ref<string | undefined>(route.query?.sort as string | undefined)

const memoParams = computed(() => ({
  ...props.filterParams,
  sort: sortString.value
  // order: getStringSortOrderValue(sortOrder.value)
}))

const { tablePagination, updateCurrentPage, updatePageSize } = usePagination({
  pageSize: 20,
  isMemorizedPage: false,
  otherMemoParams: memoParams
})

const { data, isLoading } = useGetRegisterNumber(() =>
  cleanObject({
    unitId: props?.filterParams?.ownBookUnit?.id!,
    page: tablePagination.value.current,
    size: tablePagination.value.pageSize,
    sort: sortString.value ? [sortString.value] : [],
    status: props?.filterParams?.status?.map((status) => status?.value)?.[0],
    documentBookId: props?.filterParams?.documentBook?.map((book) => book?.value)?.[0],
    search: props?.filterParams?.search
  })
)

const handleUpdateSortData = (e: DataTableSortEvent) => {
  // sortField.value = e.sortField as string
  // sortOrder.value = !!e.sortOrder ? e.sortOrder : 0
  if (!e.sortOrder) return (sortString.value = undefined)
  sortString.value = `${e.sortField},${getStringSortOrderValue(e.sortOrder)}`
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
    :sort-field="sortString?.split(',')?.[0]"
    :sort-order="getNumberSortOrderValue(sortString?.split(',')?.[1])"
    :first="tablePagination.current * tablePagination.pageSize"
    removableSort
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    @update:rows="updatePageSize"
    @sort="handleUpdateSortData"
  >
    <template #indexCustom="{ index }">
      <span>{{ index + tablePagination.current * tablePagination.pageSize + 1 }}</span>
    </template>
    <template #statusSlot="{ data }">
      <div
        class="w-fit rounded-md p-2 text-center font-bold text-white"
        :class="{
          'bg-green-600': data?.status === NUMBER_REGISTER_STATUS_VALUES.used,
          'bg-yellow-400': data?.status === NUMBER_REGISTER_STATUS_VALUES.unUsed
        }"
      >
        {{ NUMBER_REGISTER_STATUS_LABELS?.[data?.status] }}
      </div>
    </template>
  </AppTable>
</template>
