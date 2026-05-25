<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import { usePagination } from '@/shared/composables/usePagination'
import type { RequestAndCreatedGuestCarVM } from '@/shared/services/api'
import { cleanObject } from '@/shared/utils/common'
import { useQueryClient } from '@tanstack/vue-query'
import { DateTime } from 'luxon'
import {
  Checkbox,
  type ColumnFilterModelType,
  type DataTableFilterEvent,
  type DataTableFilterMetaData,
  type DataTableRowClickEvent
} from 'primevue'
import { computed, ref, watch } from 'vue'
import { useGetCreatedGuestCarList } from '../composables/queries/carList/useGetCreatedGuestCarList'
import { CAR_STATUS_LIST } from '../constants/carStatus'
import type { TCommonRequestCarFilter } from '../constants/carType'
import type { TCarStatus, TCarType, TRequestAndCreatedFilter } from '../models/common'
import ModalDetailCar from './ModalDetailCar.vue'
import ModalDetailRequestCar from './ModalDetailRequestCar.vue'

type TProps = {
  activeTab: TCarType
  filterValues: TCommonRequestCarFilter
}
type TDetailCarModalRef = InstanceType<typeof ModalDetailCar>

const columns = [
  {
    header: 'STT',
    field: 'order',
    customSlot: 'order',
    style: {
      width: '80px'
    }
  },
  {
    header: 'Khách/Đoàn khách',
    field: 'name'
  },
  {
    header: 'Biển số xe',
    field: 'licensePlate'
  },
  {
    header: 'Thòi gian làm việc',
    field: 'name',
    customSlot: 'workPeriod'
  },
  {
    field: 'status',
    header: 'Trạng thái',
    customSlot: 'status',
    showFilterMenu: true,
    showFilterMatchModes: false,
    filterMenuStyle: "{ width: '14rem' }",
    filterSlot: 'statusFilter',
    showApplyButton: true,
    showClearButton: true
  }
]

const emit = defineEmits<{
  (e: 'submitFilter', value: TCarStatus[] | null): void
}>()

const { activeTab, filterValues } = defineProps<TProps>()
const modalDetailCarModalRef = ref<TDetailCarModalRef | null>(null)

const tabIncludedFilterParams = computed(() =>
  cleanObject({
    search: filterValues?.search,
    status: filterValues?.status,
    tab: activeTab
  })
)

const { tablePagination, updateCurrentPage } = usePagination({
  isMemorizedPage: true,
  pageSize: 50,
  otherMemoParams: tabIncludedFilterParams
})

const queryClient = useQueryClient()
const { data, isLoading } = useGetCreatedGuestCarList(
  () =>
    cleanObject({
      size: tablePagination.value.pageSize,
      page: tablePagination.value.current,
      sort: ['id,desc']
    }),
  () => (filterValues?.search?.trim() ? filterValues?.search : ''),
  () => (filterValues?.status?.length ? filterValues?.status : [])
)

const filters = ref<TRequestAndCreatedFilter>({
  status: { value: [], matchMode: 'in' }
})

watch(
  () => filterValues?.status,
  (status) => {
    filters.value = {
      status: {
        value: status ?? null,
        matchMode: 'in'
      }
    }
  },
  { immediate: true, deep: true }
)

function onFilter(event: DataTableFilterEvent) {
  // call your API with event.filters
  emit(
    'submitFilter',
    (event?.filters?.status as DataTableFilterMetaData).value as TCarStatus[] | null
  )
}
const handleRowClick = (event: DataTableRowClickEvent<RequestAndCreatedGuestCarVM>) => {
  modalDetailCarModalRef?.value?.openModal(event.data.id, 'GUEST')
}
const handleAfterProcessStaffCar = () => {
  queryClient.invalidateQueries({ queryKey: ['getRequestGuestCarList'] })
}
</script>

<template>
  <AppTable
    v-model:filters="filters"
    :data="data?.docs ?? []"
    :columns="columns"
    :loading="isLoading"
    paginator
    :always-show-paginator="true"
    :totalRecords="data?.docCount"
    :lazy="true"
    :rows="tablePagination.pageSize"
    @page="({ page, rows }) => updateCurrentPage(page, rows)"
    :first="tablePagination.current * tablePagination.pageSize"
    @row-click="handleRowClick"
    filter-display="menu"
    :globalFilterFields="['status']"
    @filter="onFilter"
  >
    <template #order="{ index }">
      <span>{{
        (data?.page ?? 0) * (data?.pageSize ?? tablePagination.pageSize) + index + 1
      }}</span>
    </template>
    <template #workPeriod="{ data }">
      <span>{{
        `${data?.startDate ? DateTime.fromISO(data?.startDate).toFormat('dd/MM/yyyy') : '--'} - ${data?.endDate ? DateTime.fromISO(data?.endDate).toFormat('dd/MM/yyyy') : '--'}`
      }}</span>
    </template>
    <template #status="{ data }">
      <span
        class="inline-flex items-center justify-center rounded-md px-3 py-1 font-semibold"
        :style="{
          backgroundColor: CAR_STATUS_LIST.find((status) => status.value === data?.status)?.color
            ?.bg,
          color: CAR_STATUS_LIST.find((status) => status.value === data?.status)?.color?.text
        }"
        >{{ CAR_STATUS_LIST?.find((status) => status?.value === data?.status)?.label }}</span
      >
    </template>
    <template #statusFilter="{ filterModel }: { filterModel?: ColumnFilterModelType }">
      <div class="flex items-center gap-2" v-for="(status, idx) in CAR_STATUS_LIST" :key="idx">
        <Checkbox
          v-model="filterModel!.value"
          :input-id="status.value"
          name="status"
          :value="status.value"
        />
        <label :for="status.value"> {{ status.label }} </label>
      </div>
    </template>
  </AppTable>
  <!-- <ConfirmDialog group="confirm" class="w-[300px]">
    <template #message="{ message }">
      <div>
        <div class="mb-4 text-lg font-semibold text-red-500">{{ message?.message }}</div>
        <div>
          <span class="text-primary font-semibold">Biển số xe : </span
          >{{ (message?.data as ListGuestCarVM)?.licensePlate }}
        </div>
      </div>
    </template>
  </ConfirmDialog> -->
  <ModalDetailRequestCar
    ref="modalDetailCarModalRef"
    @processed-staff-car="handleAfterProcessStaffCar"
  />
</template>
