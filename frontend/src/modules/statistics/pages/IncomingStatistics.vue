<script setup lang="ts">
import AppSelect, {
  type TCommonSelectOptions
} from '@/shared/components/form-elements/AppSelect.vue'
import { MSG_PLEASE_SELECT } from '@/shared/constants/message-text'
import type { IncomingUnitStatisticsVM } from '@/shared/services/api'
import type ApexCharts from 'apexcharts'
import { computed, ref, watchEffect, type ComputedRef } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import OrganizationDrilldown from '../components/OrganizationDrilldown.vue'
import { useGetIDStatistic } from '../composables/queries/useGetIDStatistic'
import { UNIT_TYPE_OPTIONS, type UnitType } from '../constants/organization'

type TOrganizationDrilldownRef = InstanceType<typeof OrganizationDrilldown>

type TChartItem = IncomingUnitStatisticsVM
const organizationDrilldownRef = ref<TOrganizationDrilldownRef>()

const selectedType = ref<TCommonSelectOptions<UnitType>>(UNIT_TYPE_OPTIONS?.[0]!)
const { data, isLoading, error } = useGetIDStatistic(() => selectedType.value?.value!, {
  enabled: () => !!selectedType.value?.value
})

const chartItems: ComputedRef<TChartItem[]> = computed(() => {
  return (data?.value ?? [])?.reduce((prev, cur) => {
    // return [...prev, ...cur?.entries]
    return [...prev, ...(cur?.entries ?? [])]
  }, [] as TChartItem[])
})

// [
//   ...(data?.value?.groups ?? [])?.map((group) => ({
//     id: group?.id,
//     name: group?.name,
//     type: 'GROUP' as const,
//     stats: group.stats
//   })),
//   ...(data?.value?.individualRootUnits?.children ?? [])?.map((unit) => ({
//     id: unit?.id,
//     name: unit?.name,
//     type: 'UNITS' as const,
//     stats: unit.stats
//   }))
// ])

const getOrganizationOptions = async () => {
  return {
    options: UNIT_TYPE_OPTIONS?.map((unitType) => ({
      value: unitType.value,
      label: unitType.label
    })),
    hasMore: false
  }
}

const series = computed(() => [
  {
    name: 'Tổng văn bản',
    data: chartItems?.value?.map((item) => item?.stats?.total)
  },
  {
    name: 'Quá hạn',
    data: chartItems?.value?.map((item) => item?.stats?.overdue)
  }
])
watchEffect(() => {
  console.log(series?.value, 'dsfffadfasdasdffasdf')
})
const statistics = computed(() => {
  const processData = data?.value?.reduce(
    (prev, current) => {
      return {
        total: prev.total + current?.total?.total,
        waiting: prev.waiting + current?.total?.waiting,
        processing: prev.processing + current?.total?.processing,
        overdue: prev.overdue + current?.total?.overdue,
        overdueRate: prev.overdueRate + current?.total?.overdueRate
      }
    },
    {
      total: 0,
      waiting: 0,
      processing: 0,
      overdue: 0,
      overdueRate: 0
    }
  )
  return [
    { label: 'Tổng văn bản', value: processData?.total, color: '#18AA33' },
    { label: 'Đang xử lý', value: processData?.processing, color: '#455CD2' },
    { label: 'Chờ xử lý', value: processData?.waiting, color: '#EE8626' },
    { label: 'Quá hạn', value: processData?.overdue, color: '#ff4747' }
  ]
})

const handleXAxisClick = function (_event, _chartContext, opts) {
  if (opts?.labelIndex && chartItems?.value?.[opts?.labelIndex as number]?.children?.length)
    organizationDrilldownRef.value?.openModal(chartItems?.value?.[opts?.labelIndex as number]!)
}

const chartOptions: ComputedRef<ApexCharts.ApexOptions> = computed(() => ({
  chart: {
    events: {
      xAxisLabelClick: handleXAxisClick
    },
    fontFamily: 'Roboto, sans-serif',
    type: 'bar',
    height: 500
    // redrawOnParentResize: false,
    // redrawOnWindowResize: false
  },
  colors: ['#008ffb', '#b91c1c'],
  plotOptions: {
    bar: {
      horizontal: false
    }
  },
  // title: {
  //   text: 'Hiệu suất xử lí theo Khối - Toàn bộ tổ chức',
  //   align: 'left',
  //   margin: 10,
  //   offsetX: 0,
  //   offsetY: 0,
  //   floating: false,
  //   style: {
  //     fontSize: '14px',
  //     fontWeight: 'bold',
  //     fontFamily: undefined,
  //     color: '#263238'
  //   }
  // },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: false
  },
  xaxis: {
    categories: chartItems?.value?.map((item) => item?.shortName),
    tickPlacement: 'between',
    labels: {
      // show: true,
      //   rotate: -45,
      //   rotateAlways: false,
      // hideOverlappingLabels: true,
      //   showDuplicates: false,
      trim: true
      //   minHeight: undefined,
      //   maxHeight: 120,
      //   style: {
      //     colors: [],
      //     fontSize: '12px',
      //     fontFamily: 'Helvetica, Arial, sans-serif',
      //     fontWeight: 400,
      //     cssClass: 'apexcharts-xaxis-label'
      //   },
      //   offsetX: 0,
      //   offsetY: 0,
      //   format: undefined,
      //   formatter: undefined,
      //   datetimeUTC: true,
      //   datetimeFormatter: {
      //     year: 'yyyy',
      //     month: "MMM 'yy",
      //     day: 'dd MMM',
      //     hour: 'HH:mm',
      //     minute: 'HH:mm:ss',
      //     second: 'HH:mm:ss'
      //   }
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    shared: true,
    intersect: false,
    custom: function ({ _series, _seriesIndex, dataPointIndex, _w }) {
      return `
        <div class='p-3'>
          <div class="tooltip-title">Tổng văn bản của đơn vị / khối đơn vị: <b>${chartItems?.value?.[dataPointIndex]?.stats?.total}</b></div>
          <div>Văn bản chờ xử lý: <b>${chartItems?.value?.[dataPointIndex]?.stats?.waiting}</b></div>
          <div>Văn bản đang xử lý: <b>${chartItems?.value?.[dataPointIndex]?.stats?.processing}</b></div>
          <div>Văn bản quá hạn:<b>${chartItems?.value?.[dataPointIndex]?.stats?.overdue}</b></div>
          <div>
            Tỉ lệ quá hạn: <b>${chartItems?.value?.[dataPointIndex]?.stats?.overdueRate}%</b>
          </div>
        </div>
      `
    }
  }
}))
</script>

<template>
  <div>
    <!-- Filter -->
    <div class="">
      <AppSelect
        label="Chọn loại đơn vị"
        :placeholder="MSG_PLEASE_SELECT"
        name="organization"
        :searchable="false"
        :fetch-options="getOrganizationOptions"
        class="mb-4"
        v-model="selectedType"
      ></AppSelect>
    </div>

    <!-- Card -->
    <div class="mb-4">
      <div class="grid grid-cols-2 gap-8 xl:grid-cols-4">
        <div
          v-for="item in statistics"
          :key="item.label"
          class="card flex h-40 flex-col justify-between shadow-[0px_12px_24px_-4px_#919eab33]"
        >
          <div class="text-center text-xl font-semibold" :style="{ color: item?.color }">
            {{ item.label }}
          </div>

          <div class="text-center text-5xl font-semibold">
            {{ item.value }}
          </div>
          <div></div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="isLoading" class="relative flex h-50 items-center justify-center">
      <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
    </div>
    <div v-else-if="error" class="border-shadow relative flex h-50 items-center justify-center">
      {{ error?.response?.data?.detail ?? error?.message ?? 'Có lỗi khi xem trước văn bản' }}
    </div>
    <div class="card w-full [&_.apexcharts-xaxis_text]:cursor-pointer">
      <VueApexCharts
        v-if="chartItems?.length"
        type="bar"
        width="100%"
        height="500"
        :options="chartOptions"
        :series="series"
      />
      <div class="flex h-[500px] items-center justify-center" v-else>Không có dữ liệu</div>
    </div>

    <!-- Modal  -->
    <OrganizationDrilldown ref="organizationDrilldownRef" />
  </div>
</template>
