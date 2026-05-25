<script setup lang="ts">
import { APP_PERMISSION_VALUES, type TAppFeatureKey } from '@/shared/constants/permission'
import { ROUTE_PATHS } from '@/shared/constants/router'
import { useUserProfileStore } from '@/shared/stores/userProfileStore'
import { checkMatchEnv } from '@/shared/utils/common'
import { intersection } from 'lodash-es'
import { computed, watchEffect, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import DragScroll from '../components/DragScroll.vue'
import { useGetStatistic } from '../composables/queries/useGetStatistic'

type TDashboardItem = {
  title: string
  color: string
  // span: number
  class: string
  isVisible: boolean
  listItems: {
    count: number
    subject: string
    description: string
    isVisible: boolean
    path: string
  }[]
}

const router = useRouter()

const { data: statistic, isLoading, error } = useGetStatistic()
// const { data: statistic, isLoading, error } = valueeee
const checkHust = checkMatchEnv(['hust_staging', 'prod_hust'])
const checkHmuAndHmuh = checkMatchEnv(['hmu_staging', 'prod_hmu', 'hmuh_staging', 'prod_hmuh'])
const profileStore = useUserProfileStore()
const checkIfHasPermission = (permissions: TAppFeatureKey[]) => {
  if (
    permissions?.length &&
    !intersection(permissions, profileStore?.user?.currentPermission)?.length
  )
    return false
  return true
}

const infoList: ComputedRef<TDashboardItem[]> = computed(() => [
  {
    title: 'Văn bản đến',
    color: '#18AA33',
    // span: checkHust || checkHmuAndHmuh ? 12 : 8,
    class: 'col-span-12',
    isVisible: true,
    listItems: [
      {
        count: statistic?.value?.data?.incomingStatsDto?.waitingProcess ?? 0,
        subject: 'Văn bản',
        description: 'chờ xử lý',
        isVisible: true,
        path: ROUTE_PATHS.incomingDoc.inDocProcessing
      },
      {
        count: statistic?.value?.data?.incomingStatsDto?.processing ?? 0,
        subject: 'Văn bản',
        description: 'đang xử lý',
        isVisible: true,
        path: `${ROUTE_PATHS.incomingDoc.inDocProcessing}?page=1&tab=PROCESSING`
      },
      {
        count: statistic?.value?.data?.incomingStatsDto?.dueSoon ?? 0,
        subject: 'Văn bản',
        description: 'sắp đến hạn (chờ/đang xử lý)',
        isVisible: true,
        path: `${ROUTE_PATHS.incomingDoc.inDocProcessing}?page=1&tab=PROCESSING`
      },
      {
        count: statistic?.value?.data?.incomingStatsDto?.overdue ?? 0,
        subject: 'Văn bản',
        description: 'quá hạn (chờ/đang xử lý)',
        isVisible: true,
        path: `${ROUTE_PATHS.incomingDoc.inDocProcessing}?page=1&tab=PROCESSING`
      },
      {
        count: statistic?.value?.data?.incomingStatsDto?.needReceive ?? 0,
        subject: 'Văn bản',
        description: 'qua mạng cần nhập sổ',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.receiveInternetIndoc]),
        path: `${ROUTE_PATHS.incomingDoc.inDocInternet}`
      },
      // {
      //   count: statistic?.value?.incomingStatsDto?.needEntryBookLinked ?? 0,
      //   subject: 'Văn bản',
      //   description: 'liên thông cần nhập sổ',
      //   isVisible:
      //     checkIfHasPermission([APP_PERMISSION_VALUES.receiveInternetIndoc]) &&
      //     checkMatchEnv(['hust_staging', 'prod_hust']),
      //   path: `${ROUTE_PATHS.incomingDoc.inDocInternet}`
      // },
      {
        count: statistic?.value?.data?.incomingStatsDto?.rejected ?? 0,
        subject: 'Văn bản',
        description: 'bị trả lại',
        isVisible:
          checkIfHasPermission([
            APP_PERMISSION_VALUES.createPaperIndoc,
            APP_PERMISSION_VALUES.distributeIndoc,
            APP_PERMISSION_VALUES.assignIndoc
          ]) && checkHmuAndHmuh,

        path: `${ROUTE_PATHS.incomingDoc.inDocRejected}`
      }
    ]
  },
  {
    title: 'Văn bản đi',
    color: '#455CD2',
    // span: checkHust || checkHmuAndHmuh ? 12 : 8,
    class: 'col-span-12',
    isVisible: true,
    listItems: [
      {
        count: statistic?.value?.data?.outgoingStatsDto?.waitingProcess ?? 0,
        subject: 'Văn bản',
        description: 'chờ xử lý',
        isVisible: true,
        path: `${ROUTE_PATHS.outDoc.process}`
      },
      {
        count: statistic?.value?.data?.outgoingStatsDto?.returned ?? 0,
        subject: 'Văn bản',
        description: 'bị trả lại',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.registerOutDoc]),
        path: `${ROUTE_PATHS.outDoc.reject}`
      },
      {
        count: statistic?.value?.data?.outgoingStatsDto?.waitingNumber ?? 0,
        subject: 'Văn bản',
        description: 'chờ cấp số',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.issueOutDoc]),
        path: `${ROUTE_PATHS.outDoc.issue}`
      },
      {
        count: statistic?.value?.data?.outgoingStatsDto?.waitingSend ?? 0,
        subject: 'Văn bản',
        description: 'chờ gửi',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.issueOutDoc]),
        path: `${ROUTE_PATHS.outDoc.issue}?page=1&tab=WAITING_SENDING`
      }
      // {
      //   count: statistic?.value?.outgoingStatsDto?.waitingApproveNumber ?? 0,
      //   subject: 'Đăng ký giữ số',
      //   description: 'chờ duyệt',
      //   isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.manageKeepNumber]),
      //   path: `${ROUTE_PATHS.outDoc.keepNumber}`
      // }
    ]
  },
  {
    title: 'Văn bản nội bộ',
    color: '#EE8626',
    // span: checkHust || checkHmuAndHmuh ? 12 : 8,
    class: 'col-span-12',
    isVisible: true,
    listItems: [
      {
        count: statistic?.value?.data?.internalStatsDto?.waitingProcess ?? 0,
        subject: 'Văn bản',
        description: 'chờ xử lý',
        isVisible: true,
        path: `${ROUTE_PATHS.internalDoc.process}`
      },
      {
        count: statistic?.value?.data?.internalStatsDto?.returned ?? 0,
        subject: 'Văn bản',
        description: 'bị trả lại',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.registerOutDoc]),
        path: `${ROUTE_PATHS.internalDoc.reject}`
      }
    ]
  },
  {
    title: 'Công việc và Hồ sơ công việc',
    color: '#9C27B0',
    // span: checkHust || checkHmuAndHmuh ? 12 : 8,
    class: 'col-span-12',
    isVisible: true,
    listItems: [
      {
        count: statistic?.value?.data?.taskAndWorkStatsDto?.workProcessing ?? 0,
        subject: 'Công việc',
        description: 'đang thực hiện',
        isVisible: true,
        path: `${ROUTE_PATHS.task.taskList}`
      },
      //Note: đang để tạm, khi nào update xong cần cập nhật lại
      {
        count: statistic?.value?.data?.taskAndWorkStatsDto?.recordsPendingEvaluation ?? 0,
        subject: 'Hồ sơ công việc',
        description: 'chờ duyệt',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.evaluateWordRecord]),
        path: `${ROUTE_PATHS.internalDoc.reject}`
      },
      {
        count: statistic?.value?.data?.taskAndWorkStatsDto?.recordsPendingArchival ?? 0,
        subject: 'Hồ sơ công việc',
        description: 'chờ duyệt lưu trữ',
        isVisible: checkIfHasPermission([APP_PERMISSION_VALUES.archiveUniversityWorkRecord]),
        path: `${ROUTE_PATHS.internalDoc.reject}`
      }
    ]
  },
  {
    title: 'Đăng ký xe',
    color: '#00C7E6',
    // span: checkHust || checkHmuAndHmuh ? 12 : 8,
    class: 'col-span-12',
    isVisible: checkMatchEnv(['hust_staging', 'prod_hust']),
    listItems: [
      {
        count: statistic?.value?.data?.carStatsDto?.pendingApproval ?? 0,
        subject: 'Đăng ký xe',
        description: 'cần duyệt',
        isVisible: true,
        path: `${ROUTE_PATHS.car.requestList}`
      }
    ]
  }
])
watchEffect(() => {
  console.log(statistic.value, 'infoListinfoList')
})

const visibleInfoList = computed<TDashboardItem[]>(() =>
  infoList.value
    .filter((item) => item.isVisible)
    .map((item) => ({
      ...item,
      listItems: item.listItems.filter((li) => li.isVisible)
    }))
    .filter((item) => item.listItems.length > 0)
)
</script>

<template>
  <div class="flex h-full items-center justify-center" v-if="isLoading">
    <span class="icon-[line-md--loading-twotone-loop] text-primary text-5xl"></span>
  </div>
  <div class="flex h-full items-center justify-center" v-else-if="error">
    {{
      error?.response?.data?.detail ?? error?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
    }}
  </div>
  <div v-else>
    <DragScroll :statistic="statistic!" />
    <div class="grid grid-cols-24 gap-4">
      <div v-for="(item, idx) in visibleInfoList" :key="idx" :class="item?.class">
        <div class="border-shadow h-full rounded-lg bg-white p-4">
          <div class="flex items-center gap-2">
            <h2 class="overflow-hidden text-2xl font-semibold" :style="`color: ${item?.color}`">
              {{ item.title }}
            </h2>
          </div>

          <div v-for="(listItem, idx) in item.listItems" :key="listItem.subject">
            <div :class="idx !== item.listItems.length - 1 ? 'border-b border-[#E0E0E0]' : ''">
              <div
                class="flex h-full cursor-pointer items-center justify-between gap-4 p-0.5"
                @click="router.push(listItem.path)"
              >
                <span>
                  <span>{{ listItem.subject }}</span>
                  <span>&nbsp;</span>
                  <span class="font-semibold">{{ listItem.description }}</span>
                </span>
                <p class="text-3xl font-semibold" :style="`color: ${item?.color}`">
                  {{ listItem.count }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
