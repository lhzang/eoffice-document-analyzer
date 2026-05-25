<script setup lang="ts" generic="T">
import { Button } from 'primevue'
import Column, { type ColumnProps } from 'primevue/column'
import DataTable, {
  type DataTableFilterEvent,
  type DataTableFilterMeta,
  type DataTablePageEvent,
  type DataTableProps,
  type DataTableRowClickEvent,
  type DataTableRowCollapseEvent,
  type DataTableRowDoubleClickEvent,
  type DataTableRowExpandEvent,
  type DataTableRowSelectEvent,
  type DataTableRowUnselectEvent,
  type DataTableSelectAllChangeEvent,
  type DataTableSortEvent
} from 'primevue/datatable'

// Define component props
type TProps = Omit<
  Partial<DataTableProps>,
  'value' | 'selectionMode' | 'size' | 'selection' | 'rowHover' | 'filterLocale'
> & {
  data: T[]
  selectionMode?: 'single' | 'multiple'
  size?: 'small' | 'large' | 'null'
  columns: (Omit<ColumnProps, 'field'> & {
    field?: string | ((item: T) => string)
    customSlot?: string
    filterSlot?: string
    customHeaderSlot?: string
  })[]
  fixedLayout?: boolean
}

// Define props
const {
  size = 'null',
  data,
  columns,
  showHeaders = true,
  selectionMode,
  pt,
  stripedRows = true,
  // fixedLayout = true,
  ...props
} = defineProps<TProps>()

const emit = defineEmits<{
  'row-click': [event: DataTableRowClickEvent<T>]
  'select-all-change': [event: DataTableSelectAllChangeEvent]
  'row-dblclick': [event: DataTableRowDoubleClickEvent]
  'update:sortField': [value: string]
  'update:sortOrder': [value: number | undefined]
  'update:filters': [value: DataTableFilterMeta]
  'update:rows': [value: number]
  // 'update:selection': [value: T | T[] | null];
  'row-expand': [event: DataTableRowExpandEvent]
  'row-select': [event: DataTableRowSelectEvent<T>]
  'row-unselect': [event: DataTableRowUnselectEvent]
  'row-collapse': [event: DataTableRowCollapseEvent]
  page: [event: DataTablePageEvent]
  'page-count': [event: DataTablePageEvent]
  sort: [event: DataTableSortEvent]
  filter: [event: DataTableFilterEvent]
  first: [first?: number]
}>()

const selectedRecord = defineModel<T | T[]>('selection')
const filters = defineModel<DataTableFilterMeta>('filters')

const onRowClick = (event: DataTableRowClickEvent) => {
  emit('row-click', event)
}

const onPage = (event: DataTablePageEvent) => {
  emit('page', event)
}
const onChangePageSize = (value: number) => {
  emit('update:rows', value)
}

const onSort = (event: DataTableSortEvent) => {
  emit('sort', event)
}
</script>

<template>
  <div class="card">
    <DataTable
      v-model:selection="selectedRecord"
      :value="data"
      :size
      :columns="columns"
      v-bind="props"
      v-model:filters="filters"
      @update:filters="(e) => emit('update:filters', e)"
      :show-headers
      :row-hover="true"
      scrollable
      filterLocale="vi"
      :striped-rows="stripedRows"
      @row-click="onRowClick"
      @page="onPage"
      @update:rows="onChangePageSize"
      @row-select="(event) => emit('row-select', event)"
      @row-unselect="(event) => emit('row-unselect', event)"
      @select-all-change="
        (event: DataTableSelectAllChangeEvent) => emit('select-all-change', event)
      "
      @sort="onSort"
      @filter="(event) => emit('filter', event)"
      :pt="{
        tbody: { class: loading ? 'h-[300px]' : '' },
        emptymessage: { class: 'h-[300px]' },
        bodyRow: { class: 'cursor-pointer' },
        table: { style: { tableLayout: fixedLayout ? 'fixed' : 'auto' } },
        ...pt
      }"
    >
      <template v-if="$slots.header" #header>
        <slot name="header"></slot>
      </template>
      <Column
        v-if="selectionMode"
        :selectionMode="selectionMode"
        :exportable="false"
        headerStyle="width: 3rem"
        :pt="{
          columnHeaderContent: {
            class: $slots.customHeaderSelectSlot ? 'flex items-center flex-row-reverse' : ''
          }
        }"
      >
        <template v-if="$slots.customHeaderSelectSlot" #header>
          <slot name="customHeaderSelectSlot"></slot>
        </template>
      </Column>
      <template #loading>
        <div class="flex items-center justify-center p-4">
          <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
        </div>
      </template>
      <template #empty>
        <div v-show="!loading" class="flex flex-col items-center justify-center p-4">
          <span class="icon-[mdi--flask-empty-remove-outline] text-5xl text-gray-400"></span>
          <span class="text-2xl font-medium text-gray-400">Không có dữ liệu</span>
        </div>
      </template>
      <Column
        v-for="(col, index) of columns"
        :key="index"
        :field="col.field"
        :header="col.header"
        :filterField="col.field"
        v-bind="col"
      >
        <!-- filter slot -->
        <template v-if="col.filterSlot" #filter="{ filterModel }">
          <slot v-if="col.filterSlot" :name="col.filterSlot" :filterModel />
        </template>
        <!-- header slot -->
        <template v-if="col.customHeaderSlot" #header>
          <slot :name="col.customHeaderSlot" />
        </template>
        <template v-if="col.filterSlot" #filterclear="{ filterCallback }">
          <Button
            type="button"
            label="Đặt lại"
            severity="secondary"
            size="small"
            variant="outlined"
            @click="filterCallback"
          />
        </template>
        <template v-if="col.filterSlot" #filterapply="{ filterCallback }">
          <Button
            type="button"
            label="Áp dụng"
            size="small"
            severity="success"
            @click="filterCallback"
          />
        </template>
        <!-- body slot -->
        <template v-if="col.customSlot" #body="{ data, index }: { data: T; index: number }">
          <slot :name="col.customSlot" :data="data" :index="index" />
        </template>
      </Column>
      <template #expansion="{ data }">
        <slot name="expansion" :data="data"></slot>
      </template>
    </DataTable>
  </div>
</template>
