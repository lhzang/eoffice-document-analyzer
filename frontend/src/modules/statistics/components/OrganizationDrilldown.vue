<script setup lang="ts">
import AppTable from '@/shared/components/AppTable.vue'
import AppModal from '@/shared/components/modals/AppModal.vue'
import type { IncomingUnitStatisticsVM } from '@/shared/services/api'
import type { ColumnProps } from 'primevue'
import ToggleSwitch from 'primevue/toggleswitch'
import { computed, ref, type ComputedRef } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useGetIDStatisticByUnit } from '../composables/queries/useGetIDStatisticByUnit'

const isVisible = ref(false)
const isShowOverDueOnly = ref(false)
const selectedChildUnit = ref<IncomingUnitStatisticsVM>()

const selectedUnit = ref<IncomingUnitStatisticsVM>()

const sortedChildrenUnitsOfSelectedUnit = computed(() =>
  (selectedUnit?.value?.children ?? [])
    ?.sort((childA, childB) => childA?.stats?.overdue - childB?.stats?.overdue)
    ?.filter((unit) => (isShowOverDueOnly.value ? unit?.stats?.overdue : true))
)

const {
  data: detailUnitStatistic,
  isLoading: isLoadingDetailUnit,
  error
} = useGetIDStatisticByUnit(() => selectedChildUnit?.value?.id!, {
  enabled: () => !!selectedChildUnit?.value?.id
})

const formattedDetailUnitStatisticChildren = computed(
  () => detailUnitStatistic?.value?.children ?? []
)

const columns: (Omit<ColumnProps, 'field'> & {
  field?: string
  customSlot?: string
  customHeaderSlot?: string
})[] = [
  {
    header: 'Tên đơn vị',
    field: 'name'
  },
  {
    header: 'Tổng văn bản của đơn vị',
    field: 'stats.total',
    style: { textAlign: 'center' }
  },
  {
    header: 'Văn bản chờ xử lý',
    field: 'stats.processing',
    style: { textAlign: 'center' }
  },
  {
    header: 'Văn bản quá hạn',
    field: 'stats.overdue',
    style: { textAlign: 'center' }
  },
  {
    header: 'Tỉ lệ quá hạn',
    field: 'stats.overdueRate',
    style: {
      textAlign: 'center',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }
]

const series = computed(() => [
  {
    name: 'Văn bản xử lí',
    data: sortedChildrenUnitsOfSelectedUnit?.value?.map((item) => item?.stats?.processing)
  },
  {
    name: 'Quá hạn',
    data: sortedChildrenUnitsOfSelectedUnit?.value?.map((item) => item?.stats?.overdue)
  }
])

const handleXAxisClick = function (_event, _chartContext, opts) {
  if (opts?.labelIndex)
    selectedChildUnit.value =
      sortedChildrenUnitsOfSelectedUnit?.value?.[opts?.labelIndex as number]!
}

const chartOptions: ComputedRef<ApexCharts.ApexOptions> = computed(() => ({
  chart: {
    events: {
      xAxisLabelClick: handleXAxisClick
    },
    type: 'bar',
    stacked: true
  },
  noData: {
    text: 'No data',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      fontSize: '14px'
    }
  },
  colors: ['#008ffb', '#b91c1c'],
  plotOptions: {
    bar: {
      horizontal: true
    }
  },
  stroke: {
    show: false
  },
  xaxis: {
    categories: (sortedChildrenUnitsOfSelectedUnit?.value ?? [])?.map((unit) => unit?.shortName)
  },

  tooltip: {
    shared: true,
    intersect: false,
    custom: function ({ _series, _seriesIndex, dataPointIndex, _w }) {
      return `
        <div class='p-3'>
          <div class="tooltip-title">Tổng văn bản của đơn vị: <b>${sortedChildrenUnitsOfSelectedUnit?.value?.[dataPointIndex]?.stats?.total}</b></div>
          <div>Văn bản chờ xử lý: <b>${sortedChildrenUnitsOfSelectedUnit?.value?.[dataPointIndex]?.stats?.waiting}</b></div>
          <div>Văn bản đang xử lý: <b>${sortedChildrenUnitsOfSelectedUnit?.value?.[dataPointIndex]?.stats?.processing}</b></div>
          <div>Văn bản quá hạn:<b>${sortedChildrenUnitsOfSelectedUnit?.value?.[dataPointIndex]?.stats?.overdue}</b></div>
          <div>
            Tỉ lệ quá hạn: <b>${sortedChildrenUnitsOfSelectedUnit?.value?.[dataPointIndex]?.stats?.overdueRate}%</b>
          </div>
        </div>
    `
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    offsetX: 40
  }
}))

const handleReset = () => {
  selectedChildUnit.value = undefined
  selectedUnit.value = undefined
  isShowOverDueOnly.value = false
}

const handleOpenModal = (selectedChartItem: IncomingUnitStatisticsVM) => {
  isVisible.value = true
  selectedUnit.value = selectedChartItem
}

const handleCloseModal = () => {
  isVisible.value = false
}

const handleVisibleChange = (visible: boolean) => {
  if (!visible) handleReset()
}

defineExpose({
  openModal: handleOpenModal,
  closeModal: handleCloseModal
})
</script>

<template>
  <AppModal
    v-model:visible="isVisible"
    :footer="false"
    @update:visible="handleVisibleChange"
    :wrapper-style="{ width: '99%', height: '99%', maxHeight: '98%', overflowY: 'auto' }"
    :classContent="'!pt-0 !p-4 h-full'"
    :title="`Thống kê văn bản đến - ${selectedUnit?.name}`"
  >
    <!-- filter  -->
    <div class="mb-4 flex justify-end">
      <div class="flex items-center justify-between gap-2">
        <span class="text-primary">Đơn vị quá hạn</span>
        <span class="flex items-center justify-center"
          ><ToggleSwitch v-model="isShowOverDueOnly"
        /></span>
      </div>
    </div>

    <!-- chart -->
    <div class="mb-4 w-full [&_.apexcharts-yaxis-label]:cursor-pointer">
      <VueApexCharts
        v-if="sortedChildrenUnitsOfSelectedUnit?.length"
        width="100%"
        height="500"
        :options="chartOptions"
        :series="series"
      />
      <div class="flex h-[500px] items-center justify-center" v-else>Không có dữ liệu</div>
    </div>

    <AppTable
      v-if="selectedChildUnit"
      :loading="isLoadingDetailUnit"
      :data="formattedDetailUnitStatisticChildren"
      :columns="columns"
      class="mb-8 ml-12"
    />
  </AppModal>
</template>
